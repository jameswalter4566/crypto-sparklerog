import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Database } from "../_shared/database.types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);
  
  try {
    const response = await fetch(`https://pump.fun/coin/${tokenAddress}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache'
      },
    });

    if (!response.ok) {
      console.error('Pump.fun API error:', response.status);
      throw new Error(`Pump.fun API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Pump.fun data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error('Token ID is required');
    }

    console.log('Processing request for token:', id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Get coin data from database
    const { data: dbCoin, error: dbError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch token data from database');
    }

    try {
      // Always fetch fresh data from Pump.fun
      const pumpData = await fetchPumpFunData(id);
      
      if (pumpData) {
        // Transform Pump.fun data to match our schema
        const transformedData = {
          id: id,
          name: pumpData.name || "Unknown Token",
          symbol: pumpData.symbol || "???",
          price: pumpData.price || null,
          market_cap: pumpData.marketCap || null,
          volume_24h: pumpData.volume24h || null,
          total_supply: pumpData.totalSupply || null,
          image_url: pumpData.image || null,
          solana_addr: id,
          description: pumpData.description || null,
          decimals: pumpData.decimals || null,
          updated_at: new Date().toISOString(),
        };

        // Update database with new data
        const { error: updateError } = await supabase
          .from('coins')
          .upsert(transformedData);

        if (updateError) {
          console.error('Error updating coin data:', updateError);
        }

        return new Response(
          JSON.stringify({
            terminalData: transformedData,
            mainData: transformedData
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Error fetching from Pump.fun:', error);
      // If we have database data, return that as fallback
      if (dbCoin) {
        return new Response(
          JSON.stringify({
            terminalData: dbCoin,
            mainData: dbCoin
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    throw new Error('Failed to fetch token data');

  } catch (error) {
    console.error('Error in get-coin function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});