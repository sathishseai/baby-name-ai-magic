
-- Create payments table to store Razorpay orders and payment details
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL, -- Amount in paise (smallest currency unit)
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created', -- created, paid, failed, refunded
  credits_to_add INTEGER NOT NULL,
  payment_method TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credits_ledger table to track all credit transactions
CREATE TABLE public.credits_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  payment_id UUID REFERENCES public.payments,
  credits_added INTEGER NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'purchase', -- purchase, usage, refund, bonus
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments table
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
  ON public.payments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for credits_ledger table
CREATE POLICY "Users can view their own credit transactions" 
  ON public.credits_ledger 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions" 
  ON public.credits_ledger 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to process successful payments (atomic transaction)
CREATE OR REPLACE FUNCTION public.process_successful_payment(
  p_payment_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_record RECORD;
  current_credits INTEGER;
BEGIN
  -- Get payment details
  SELECT * INTO payment_record 
  FROM payments 
  WHERE id = p_payment_id AND status = 'created';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or already processed';
  END IF;

  -- Update payment status
  UPDATE payments 
  SET 
    status = 'paid',
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    payment_method = p_payment_method,
    updated_at = now()
  WHERE id = p_payment_id;

  -- Add credits to user profile
  UPDATE profiles 
  SET 
    credits = credits + payment_record.credits_to_add,
    updated_at = now()
  WHERE id = payment_record.user_id;

  -- Record credit transaction
  INSERT INTO credits_ledger (
    user_id,
    payment_id,
    credits_added,
    transaction_type,
    description
  ) VALUES (
    payment_record.user_id,
    p_payment_id,
    payment_record.credits_to_add,
    'purchase',
    'Credits purchased via Razorpay - Order ID: ' || payment_record.razorpay_order_id
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to process payment: %', SQLERRM;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX idx_credits_ledger_user_id ON public.credits_ledger(user_id);
CREATE INDEX idx_credits_ledger_payment_id ON public.credits_ledger(payment_id);
