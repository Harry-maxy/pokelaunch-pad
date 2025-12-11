import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, body } = await req.json();
    console.log(`Pump proxy request for endpoint: ${endpoint}`);

    if (endpoint === 'trade-local') {
      console.log('Processing trade-local request');
      const response = await fetch('https://pumpportal.fun/api/trade-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Trade-local error: ${errorText}`);
        return new Response(
          JSON.stringify({ error: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('Trade-local request successful');
      return new Response(
        JSON.stringify({ transaction: base64 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (endpoint === 'ipfs') {
      console.log('Processing IPFS upload request');
      const formData = new FormData();
      formData.append('name', body.name);
      formData.append('symbol', body.symbol);
      formData.append('description', body.description);
      formData.append('showName', 'true');
      if (body.twitter) formData.append('twitter', body.twitter);
      if (body.website) formData.append('website', body.website);
      
      if (body.imageBase64) {
        const imageData = body.imageBase64.split(',')[1] || body.imageBase64;
        const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
        formData.append('file', new Blob([binaryData], { type: 'image/png' }), 'image.png');
      }

      const response = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('IPFS upload successful:', data);
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.error(`Invalid endpoint: ${endpoint}`);
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Pump proxy error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
