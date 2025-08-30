
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  credits: number;
}

const CREDIT_PACKAGES = {
  5: { amount: 5000, credits: 5 }, // ₹50 for 5 credits
  15: { amount: 12000, credits: 15 }, // ₹120 for 15 credits (25% bonus)
  35: { amount: 25000, credits: 35 }, // ₹250 for 35 credits (40% bonus)
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Create Supabase client with the user's JWT token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { credits }: CreateOrderRequest = await req.json();

    // Validate credit package
    const packageInfo = CREDIT_PACKAGES[credits as keyof typeof CREDIT_PACKAGES];
    if (!packageInfo) {
      throw new Error("Invalid credit package");
    }

    // Create Razorpay order
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: packageInfo.amount, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          user_id: user.id,
          credits: credits.toString(),
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      throw new Error("Failed to create Razorpay order");
    }

    const razorpayOrder = await orderResponse.json();
    console.log("Razorpay order created:", razorpayOrder);

    // Store payment record in Supabase
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        razorpay_order_id: razorpayOrder.id,
        amount: packageInfo.amount,
        credits_to_add: packageInfo.credits,
        status: "created",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to store payment record:", paymentError);
      console.error("Supabase error details:", paymentError.message);
      throw new Error(`Failed to store payment record: ${paymentError.message}`);
    }

    console.log("Payment record stored:", payment);

    return new Response(
      JSON.stringify({
        razorpay_order: razorpayOrder,
        payment_id: payment.id,
        key_id: razorpayKeyId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
