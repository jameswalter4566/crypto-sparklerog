import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { fetchSolscanData } from "../_shared/solscan.ts";

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
    const { solana_addr } = await req.json();
    
    if (!solana_addr) {
      throw new Error('Solana address is required');
    }

    console.log('Processing request for Solana address:', solana_addr);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if coin exists and get minimal data
    const { data: existingCoin } = await supabaseClient
      .from('coins')
      .select('id, updated_at')
      .eq('id', solana_addr)
      .maybeSingle();

    // Only fetch new data if coin doesn't exist or data is older than 5 minutes
    const shouldFetchNewData = !existingCoin || 
      (new Date().getTime() - new Date(existingCoin.updated_at).getTime()) > 5 * 60 * 1000;

    let tokenData;
    if (shouldFetchNewData) {
      console.log('Fetching fresh data from Solscan');
      const solscanData = await fetchSolscanData(solana_addr);
      
      if (!solscanData || !solscanData.data) {
        throw new Error('Invalid token data received from Solscan');
      }

      // Prepare minimal required data for database
      tokenData = {
        id: solana_addr,
        name: solscanData.data.name,
        symbol: solscanData.data.symbol,
        price: solscanData.data.price,
        market_cap: solscanData.data.marketcap,
        volume_24h: solscanData.data.volume24h,
        change_24h: solscanData.data.priceChange24h,
        image_url: solscanData.data.icon,
        solana_addr: solana_addr,
        updated_at: new Date().toISOString()
      };

      // Upsert only necessary fields
      const { error: upsertError } = await supabaseClient
        .from('coins')
        .upsert(tokenData);

      if (upsertError) {
        console.error('Database error:', upsertError);
        throw new Error('Failed to save coin data');
      }
    } else {
      console.log('Using existing coin data');
      const { data: coin, error } = await supabaseClient
        .from('coins')
        .select('id, name, symbol, price, market_cap, volume_24h, change_24h, image_url, solana_addr, updated_at')
        .eq('id', solana_addr)
        .single();

      if (error) throw error;
      tokenData = coin;
    }

    return new Response(
      JSON.stringify(tokenData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in add-coin function:', error);
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