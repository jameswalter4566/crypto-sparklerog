import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function fetchPumpFunData(solanaAddr: string) {
  const url = `https://frontend-api-v2.pump.fun/coins/${solanaAddr}`;
  console.log('Fetching from Pump.fun URL:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  console.log('Pump.fun API Response Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pump.fun API Error Response:', errorText);
    throw new Error(`Pump.fun API returned status ${response.status}`);
  }

  const rawData = await response.json();
  console.log('Raw Pump.fun API Response:', JSON.stringify(rawData, null, 2));
  
  // Validate market cap specifically
  if (rawData.market_cap) {
    console.log('Received market cap value:', rawData.market_cap);
    if (typeof rawData.market_cap !== 'number' || isNaN(rawData.market_cap)) {
      console.warn('Invalid market cap value received:', rawData.market_cap);
    }
  } else {
    console.log('No market cap value provided in API response');
  }

  return rawData;
}

serve(async (req) => {
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check existing coin
    const { data: existingCoin } = await supabaseClient
      .from('coins')
      .select('*')
      .eq('id', solana_addr)
      .maybeSingle();

    if (existingCoin) {
      console.log('Found existing coin:', existingCoin);
      // Fetch fresh data to update existing record
      const pumpData = await fetchPumpFunData(solana_addr);
      
      if (!pumpData) {
        return new Response(
          JSON.stringify(existingCoin),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log market cap update specifically
      console.log('Updating market cap from', existingCoin.market_cap, 'to', pumpData.market_cap);

      // Update existing coin with new data
      const updatedData = {
        ...existingCoin,
        price: pumpData.price ?? existingCoin.price,
        market_cap: typeof pumpData.market_cap === 'number' ? pumpData.market_cap : existingCoin.market_cap,
        volume_24h: pumpData.volume_24h ?? existingCoin.volume_24h,
        liquidity: pumpData.virtual_sol_reserves ?? existingCoin.liquidity,
        change_24h: pumpData.price_change_24h ?? existingCoin.change_24h,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedCoin, error: updateError } = await supabaseClient
        .from('coins')
        .update(updatedData)
        .eq('id', solana_addr)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating coin:', updateError);
        throw new Error('Failed to update coin data');
      }

      return new Response(
        JSON.stringify(updatedCoin),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch new coin data
    const pumpData = await fetchPumpFunData(solana_addr);

    if (!pumpData || !pumpData.mint) {
      throw new Error('Invalid response from Pump.fun API');
    }

    // Log market cap for new coin
    console.log('New coin market cap:', pumpData.market_cap);

    // Map API data to our schema
    const coinData = {
      id: solana_addr,
      name: pumpData.name || 'Unknown Token',
      symbol: pumpData.symbol || 'UNKNOWN',
      image_url: pumpData.image_uri || pumpData.image || null,
      price: typeof pumpData.price === 'number' ? pumpData.price : null,
      change_24h: typeof pumpData.price_change_24h === 'number' ? pumpData.price_change_24h : null,
      market_cap: typeof pumpData.market_cap === 'number' && !isNaN(pumpData.market_cap) ? pumpData.market_cap : null,
      volume_24h: typeof pumpData.volume_24h === 'number' ? pumpData.volume_24h : null,
      liquidity: typeof pumpData.virtual_sol_reserves === 'number' ? pumpData.virtual_sol_reserves : null,
      total_supply: typeof pumpData.total_supply === 'number' ? pumpData.total_supply : null,
      circulating_supply: typeof pumpData.circulating_supply === 'number' ? pumpData.circulating_supply : null,
      updated_at: new Date().toISOString(),
      solana_addr: solana_addr,
      description: pumpData.description || null,
      decimals: typeof pumpData.decimals === 'number' ? pumpData.decimals : null,
      historic_data: Array.isArray(pumpData.price_history) ? pumpData.price_history : null,
      homepage: pumpData.website || null,
      blockchain_site: [pumpData.explorer_url].filter(Boolean),
      chat_url: [pumpData.telegram].filter(Boolean),
      twitter_screen_name: pumpData.twitter || null,
      coingecko_id: null,
      non_circulating_supply: null,
      announcement_url: null,
      official_forum_url: null
    };

    console.log('Mapped coin data:', JSON.stringify(coinData, null, 2));

    // Insert new coin
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