import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all coins from the database
    const { data: coins, error: fetchError } = await supabase
      .from('coins')
      .select('id, solana_addr')
      .not('solana_addr', 'is', null);

    if (fetchError) {
      console.error('Error fetching coins:', fetchError);
      throw fetchError;
    }

    console.log(`Updating data for ${coins?.length || 0} coins`);

    // Update each coin's data
    for (const coin of coins || []) {
      if (!coin.solana_addr) continue;

      try {
        const response = await fetch('https://frontend-api-v2.pump.fun/coins', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://pump.fun',
            'Referer': 'https://pump.fun/',
          },
        });

        if (!response.ok) {
          console.error(`Error fetching from Pump API for ${coin.id}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const coinData = data.find((item: any) => item.mint === coin.solana_addr);

        if (coinData) {
          const price = coinData.virtual_sol_reserves / coinData.virtual_token_reserves;
          
          const { error: updateError } = await supabase
            .from('coins')
            .update({
              price: price,
              market_cap: coinData.market_cap,
              usd_market_cap: coinData.usd_market_cap,
              updated_at: new Date().toISOString()
            })
            .eq('id', coin.id);

          if (updateError) {
            console.error(`Error updating coin ${coin.id}:`, updateError);
          } else {
            console.log(`Updated data for coin ${coin.id}`);
          }
        }
      } catch (error) {
        console.error(`Error processing coin ${coin.id}:`, error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-coin-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});