import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { fetchSolscanData } from "../_shared/solscan.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { solana_addr } = await req.json();
    
    if (!solana_addr) {
      throw new Error('Solana address is required');
    }

    console.log('Fetching data for Solana address:', solana_addr);

    // Fetch data from Solscan API
    const solscanData = await fetchSolscanData(solana_addr);
    
    if (!solscanData?.success) {
      throw new Error('Failed to fetch token data from Solscan');
    }

    const tokenData = solscanData.data;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Prepare coin data for database
    const coinData = {
      id: solana_addr,
      name: tokenData.name,
      symbol: tokenData.symbol,
      price: tokenData.price,
      market_cap: tokenData.marketcap,
      volume_24h: tokenData.volume24h,
      change_24h: tokenData.priceChange24h,
      total_supply: tokenData.supply,
      decimals: tokenData.decimals,
      image_url: tokenData.icon,
      solana_addr: solana_addr,
      twitter_screen_name: tokenData.twitter?.replace('https://twitter.com/', ''),
      homepage: tokenData.website,
      updated_at: new Date().toISOString()
    };

    // Insert or update coin data in database
    const { error: upsertError } = await supabaseClient
      .from('coins')
      .upsert(coinData);

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save coin data');
    }

    return new Response(
      JSON.stringify(coinData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});