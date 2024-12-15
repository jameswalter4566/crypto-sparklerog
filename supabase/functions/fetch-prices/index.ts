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
    const { address } = await req.json();
    
    if (!address) {
      throw new Error('Token address is required');
    }

    console.log('Fetching metadata for token:', address);

    const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY');
    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY is not set');
    }

    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAccounts: [address],
          includeOffChain: true,
          disableCache: false,
        }),
      }
    );

    const data = await response.json();
    console.log('Received data from Helius:', data);

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No metadata found for token');
    }

    const metadata = data[0];
    console.log('Parsed metadata:', metadata);

    return new Response(
      JSON.stringify({
        name: metadata.onChainMetadata?.metadata?.name || metadata.offChainMetadata?.metadata?.name || 'Unknown Token',
        symbol: metadata.onChainMetadata?.metadata?.symbol || metadata.offChainMetadata?.metadata?.symbol || 'UNKNOWN',
        image: metadata.onChainMetadata?.metadata?.image || metadata.offChainMetadata?.metadata?.image || null,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in fetch-prices function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});