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
    console.log(`Fetching data from Pump API for mint address: ${mintAddress}`);
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
    const matchingCoin = data.find((item: PumpApiResponse) => item.mint === mintAddress);
    
    if (matchingCoin) {
      console.log(`Found matching coin data for ${mintAddress}:`, matchingCoin);
    } else {
      console.log(`No matching coin found for mint address: ${mintAddress}`);
    }
    
    return matchingCoin || null;
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
    console.log('Starting price update process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all coins from the database
    const { data: coins, error: fetchError } = await supabase
      .from('coins')
      .select('id, solana_addr, name')
      .not('solana_addr', 'is', null);

    if (fetchError) {
      console.error('Error fetching coins from database:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${coins?.length || 0} coins to update`);

    // Update each coin's price data
    const updates = [];
    for (const coin of coins || []) {
      if (!coin.solana_addr) {
        console.log(`Skipping coin ${coin.id} - no Solana address`);
        continue;
      }

      console.log(`Processing coin: ${coin.name} (${coin.id})`);
      const pumpData = await fetchFromPumpApi(coin.solana_addr);
      
      if (pumpData) {
        const price = pumpData.virtual_sol_reserves / pumpData.virtual_token_reserves;
        console.log(`Calculated new price for ${coin.name}: ${price} SOL`);
        
        updates.push(supabase
          .from('coins')
          .update({
            price: price,
            market_cap: pumpData.market_cap,
            usd_market_cap: pumpData.usd_market_cap,
            updated_at: new Date().toISOString()
          })
          .eq('id', coin.id)
          .then(({ error }) => {
            if (error) {
              console.error(`Error updating coin ${coin.id}:`, error);
              return { success: false, coin: coin.name, error };
            }
            console.log(`Successfully updated price for ${coin.name}`);
            return { success: true, coin: coin.name };
          })
        );
      } else {
        console.log(`No Pump.fun data found for ${coin.name}`);
      }
    }

    // Wait for all updates to complete
    const results = await Promise.all(updates);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Update complete. Successfully updated ${successful} coins. ${failed} updates failed.`);

    return new Response(JSON.stringify({ 
      success: true,
      summary: {
        total: updates.length,
        successful,
        failed
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-token-prices function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});