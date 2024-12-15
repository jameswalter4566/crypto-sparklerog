import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data from Helius:', data);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({
          name: "Unknown Token",
          symbol: "UNKNOWN",
          image: null,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const metadata = data[0];
    console.log('Parsed metadata:', metadata);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare coin data
    const coinData = {
      id: address,
      name: metadata.onChainMetadata?.metadata?.name || metadata.offChainMetadata?.metadata?.name || "Unknown Token",
      symbol: metadata.onChainMetadata?.metadata?.symbol || metadata.offChainMetadata?.metadata?.symbol || "UNKNOWN",
      image_url: metadata.onChainMetadata?.metadata?.image || metadata.offChainMetadata?.metadata?.image || null,
      updated_at: new Date().toISOString()
    };

    // Upsert coin data
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert(coinData);

    if (upsertError) {
      console.error('Error upserting coin data:', upsertError);
    }

    return new Response(
      JSON.stringify({
        name: coinData.name,
        symbol: coinData.symbol,
        image: coinData.image_url,
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