import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PUMP_API_URL = "https://frontend-api-v2.pump.fun/coins";

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
    console.log('Starting poll-new-coins function');
    
    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    console.log('Fetching coins from Pump API...');
    
    const response = await fetch(PUMP_API_URL, {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch from Pump API:', response.status, errorText);
      throw new Error(`Failed to fetch from Pump API: ${response.status}`);
    }

    // First try to get the response as text and log it
    const responseText = await response.text();
    console.log('Raw API response:', responseText);

    // Then parse it as JSON with proper error handling
    let coins;
    try {
      coins = JSON.parse(responseText);
      console.log('Parsed response:', coins);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response that failed to parse:', responseText);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from API' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate the response structure
    if (!Array.isArray(coins)) {
      console.error('Expected array of coins but got:', typeof coins);
      return new Response(
        JSON.stringify({ error: 'Invalid response format: expected array of coins' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Received ${coins.length} coins from Pump API`);

    let updatedCount = 0;
    for (const coin of coins) {
      try {
        if (!coin.mint || !coin.name || !coin.symbol) {
          console.warn('Skipping coin with missing required fields:', coin);
          continue;
        }

        // Calculate price in SOL using virtual reserves
        let priceInSol = null;
        if (coin.virtual_sol_reserves && coin.virtual_token_reserves) {
          const solAmount = coin.virtual_sol_reserves / 1e9; // Convert lamports to SOL
          const tokenAmount = coin.virtual_token_reserves / 1e9; // Assuming 9 decimals
          priceInSol = solAmount / tokenAmount;
        }

        const { error } = await supabaseAdmin
          .from('coins')
          .upsert({
            id: coin.mint,
            name: coin.name,
            symbol: coin.symbol,
            image_url: coin.image_uri,
            price: priceInSol,
            market_cap: coin.market_cap,
            usd_market_cap: coin.usd_market_cap,
            liquidity: coin.virtual_sol_reserves ? coin.virtual_sol_reserves / 1e9 : null,
            total_supply: coin.total_supply ? coin.total_supply / 1e9 : null,
            solana_addr: coin.mint,
            description: coin.description,
            homepage: coin.website,
            twitter_screen_name: coin.twitter?.replace('https://x.com/', '').replace('https://twitter.com/', ''),
            chat_url: coin.telegram ? [coin.telegram] : null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error(`Error upserting coin ${coin.mint}:`, error);
        } else {
          updatedCount++;
          console.log(`Successfully processed coin: ${coin.name} (${coin.mint})`);
        }
      } catch (error) {
        console.error(`Error processing coin ${coin?.mint || 'unknown'}:`, error);
      }
    }

    console.log(`Successfully processed ${updatedCount} coins`);

    return new Response(
      JSON.stringify({ success: true, coinsProcessed: updatedCount }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in poll-new-coins:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});