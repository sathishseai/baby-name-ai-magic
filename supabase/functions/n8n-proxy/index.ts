
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
