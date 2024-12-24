import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PumpApiResponse {
  mint: string;
  name: string;
  symbol: string;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  market_cap: number;
  usd_market_cap: number;
}

async function fetchFromPumpApi(mintAddress: string): Promise<PumpApiResponse | null> {
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
      console.error(`Error fetching from Pump API: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.find((item: PumpApiResponse) => item.mint === mintAddress) || null;
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    return null;
  }
}

Deno.serve(async (req) => {
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
      throw fetchError;
    }

    console.log(`Updating prices for ${coins.length} coins`);

    // Update each coin's price data
    for (const coin of coins) {
      if (!coin.solana_addr) continue;

      const pumpData = await fetchFromPumpApi(coin.solana_addr);
      
      if (pumpData) {
        const price = pumpData.virtual_sol_reserves / pumpData.virtual_token_reserves;
        
        const { error: updateError } = await supabase
          .from('coins')
          .update({
            price: price,
            market_cap: pumpData.market_cap,
            usd_market_cap: pumpData.usd_market_cap,
            updated_at: new Date().toISOString()
          })
          .eq('id', coin.id);

        if (updateError) {
          console.error(`Error updating coin ${coin.id}:`, updateError);
        } else {
          console.log(`Updated price for coin ${coin.id}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-token-prices function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});