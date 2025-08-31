
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('N8N Proxy: Received request', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Get the Authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('N8N Proxy: Authorization header is required');
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
      console.error('N8N Proxy: Invalid or expired token');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('N8N Proxy: Authenticated user:', user.id);

    // Check user credits before proceeding
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('N8N Proxy: Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user credits' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (profile.credits < 1) {
      console.log('N8N Proxy: Insufficient credits for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }), 
        { 
          status: 402, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') || "https://n8n.srv932017.hstgr.cloud/webhook/getbabyname";
    
    console.log('N8N Proxy: Forwarding to webhook URL:', n8nWebhookUrl);

    // Get the request body
    const requestBody = await req.text();
    console.log('N8N Proxy: Request body:', requestBody);

    // Forward the request to n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log('N8N Proxy: Response from n8n', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Get the response body
    const responseBody = await response.text();
    console.log('N8N Proxy: Response body:', responseBody);

    // If the n8n webhook was successful, consume a credit
    if (response.ok) {
      console.log('N8N Proxy: Name generation successful, consuming credit for user:', user.id);
      
      const { error: creditError } = await supabaseClient.rpc('consume_credit', {
        p_user_id: user.id,
        p_description: 'Name generation via n8n webhook'
      });

      if (creditError) {
        console.error('N8N Proxy: Failed to consume credit:', creditError);
        
        // If credit consumption fails due to insufficient credits, return error
        if (creditError.message?.includes('Insufficient credits')) {
          return new Response(
            JSON.stringify({ error: 'Insufficient credits' }), 
            { 
              status: 402, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // For other credit consumption errors, log but continue
        console.error('N8N Proxy: Credit consumption error (continuing):', creditError.message);
      } else {
        console.log('N8N Proxy: Credit consumed successfully');
      }
    } else {
      // For non-2xx responses, try to parse the error and provide helpful message
      let errorMessage = 'Failed to generate names';
      try {
        const errorData = JSON.parse(responseBody);
        if (errorData.message?.includes('not registered')) {
          errorMessage = 'Webhook not active. Please activate the workflow in n8n or try again later.';
        } else if (errorData.code === 404) {
          errorMessage = 'Name generation service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        // If we can't parse the error, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      console.log('N8N Proxy: Webhook returned error, not consuming credit');
    }

    // Return the response with CORS headers
    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });

  } catch (error) {
    console.error('N8N Proxy: Error forwarding request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to forward request to n8n webhook',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
