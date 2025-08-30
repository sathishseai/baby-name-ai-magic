
-- Create a function to consume credits atomically
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id UUID, p_description TEXT DEFAULT 'Name generation')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Check current credits and lock the row
  SELECT credits INTO current_credits
  FROM profiles 
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user has sufficient credits
  IF current_credits < 1 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct 1 credit
  UPDATE profiles 
  SET 
    credits = credits - 1,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the credit usage
  INSERT INTO credits_ledger (
    user_id,
    credits_added,
    transaction_type,
    description
  ) VALUES (
    p_user_id,
    -1,
    'usage',
    p_description
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.consume_credit(UUID, TEXT) TO authenticated;
