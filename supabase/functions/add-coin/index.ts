import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { solana_addr } = await req.json();
    console.log('Processing request for Solana address:', solana_addr);

    if (!solana_addr) {
      throw new Error('Solana address is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if coin already exists
    const { data: existingCoin } = await supabaseClient
      .from('coins')
      .select('*')
      .eq('id', solana_addr)
      .maybeSingle();

    if (existingCoin) {
      console.log('Coin already exists:', existingCoin);
      return new Response(
        JSON.stringify(existingCoin),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch data from Pump.fun API
    console.log('Fetching data from Pump.fun API...');
    const pumpResponse = await fetch(`https://frontend-api.pump.fun/coins/${solana_addr}`);
    
    if (!pumpResponse.ok) {
      console.error('Error from Pump.fun API:', await pumpResponse.text());
      throw new Error('Failed to fetch token data from Pump.fun');
    }

    const pumpData = await pumpResponse.json();
    console.log('Received data from Pump.fun:', pumpData);

    // Transform and prepare data for insertion
    const coinData = {
      id: solana_addr,
      name: pumpData.name || 'Unknown Token',
      symbol: pumpData.symbol || 'UNKNOWN',
      image_url: pumpData.image || null,
      price: pumpData.price || null,
      change_24h: pumpData.priceChange24h || null,
      market_cap: pumpData.marketCap || null,
      volume_24h: pumpData.volume24h || null,
      liquidity: pumpData.liquidity || null,
      total_supply: pumpData.totalSupply || null,
      circulating_supply: pumpData.circulatingSupply || null,
      updated_at: new Date().toISOString(),
      solana_addr: solana_addr,
    };

    // Insert the new coin data
    const { data, error: insertError } = await supabaseClient
      .from('coins')
      .insert(coinData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting coin data:', insertError);
      throw new Error('Failed to insert coin data');
    }

    console.log('Successfully inserted coin data:', data);
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-coin function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});