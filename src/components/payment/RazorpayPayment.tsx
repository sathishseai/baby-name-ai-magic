
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RazorpayPaymentProps {
  credits: number;
  amount: number;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment = ({ credits, amount, onSuccess }: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refetchProfile } = useAuth();
  const { toast } = useToast();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: { credits },
        }
      );

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "Failed to create order");
      }

      const { razorpay_order, payment_id, key_id } = orderData;

      // Configure Razorpay options with UPI preference
      const options = {
        key: key_id,
        amount: razorpay_order.amount,
        currency: razorpay_order.currency,
        name: "NameMe",
        description: `${credits} Credits Package`,
        order_id: razorpay_order.id,
        prefill: {
          email: user.email,
          name: profile?.full_name || "",
          contact: profile?.phone || "",
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        config: {
          display: {
            sequence: ['upi', 'card', 'netbanking', 'wallet', 'paylater'],
            preferences: {
              show_default_blocks: true,
            }
          }
        },
        theme: {
          color: "#6366f1",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  payment_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || "Payment verification failed");
            }

            // Refresh user profile to get updated credits
            await refetchProfile();

            toast({
              title: "Payment Successful!",
              description: `${credits} credits have been added to your account.`,
            });

            onSuccess?.();
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if credits are not reflected.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      // Open Razorpay payment modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full gradient-primary text-white hover:scale-105 transition-transform"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Smartphone className="mr-2 h-4 w-4" />
          Pay ₹{amount / 100} (UPI & More)
        </>
      )}
    </Button>
  );
};

export default RazorpayPayment;
