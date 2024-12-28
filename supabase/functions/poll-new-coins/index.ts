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
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch from Pump API:', errorText);
      throw new Error(`Failed to fetch from Pump API: ${response.status}`);
    }

    const coins = await response.json();
    console.log(`Received ${coins.length} coins from Pump API`);

    let updatedCount = 0;
    for (const coin of coins) {
      try {
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
            twitter_screen_name: coin.twitter?.replace('https://x.com/', ''),
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
        console.error(`Error processing coin ${coin.mint}:`, error);
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