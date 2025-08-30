
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  payment_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

async function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  secret: string
): Promise<boolean> {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    expectedSignature,
    new TextEncoder().encode(body)
  );
  
  const hex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return hex === razorpaySignature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const {
      payment_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    }: VerifyPaymentRequest = await req.json();

    console.log("Verifying payment:", {
      payment_id,
      razorpay_payment_id,
      razorpay_order_id,
    });

    // Verify signature
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    const isValidSignature = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValidSignature) {
      console.error("Invalid Razorpay signature");
      
      // Update payment status to failed
      await supabaseClient
        .from("payments")
        .update({
          status: "failed",
          failure_reason: "Invalid signature",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment_id)
        .eq("user_id", user.id);

      throw new Error("Invalid payment signature");
    }

    // Get payment method from Razorpay
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      }
    );

    let paymentMethod = "unknown";
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      paymentMethod = paymentData.method || "unknown";
    }

    // Process successful payment using the database function
    const { data: result, error: processError } = await supabaseClient.rpc(
      "process_successful_payment",
      {
        p_payment_id: payment_id,
        p_razorpay_payment_id: razorpay_payment_id,
        p_razorpay_signature: razorpay_signature,
        p_payment_method: paymentMethod,
      }
    );

    if (processError) {
      console.error("Failed to process payment:", processError);
      throw new Error("Failed to process payment");
    }

    console.log("Payment processed successfully");

    // Get updated user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and credits added successfully",
        credits: profile?.credits || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
