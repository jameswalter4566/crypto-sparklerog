import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { fetchFromPumpApi } from "../_shared/pump-api.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

      console.log(`Fetching fresh data from Pump API for token: ${coin.name}`);
      const pumpData = await fetchFromPumpApi('/coins', {
        searchTerm: coin.solana_addr,
        limit: 1,
        sort: 'market_cap',
        order: 'DESC',
        includeNsfw: false
      });
      
      if (pumpData && pumpData.length > 0) {
        const tokenData = pumpData[0];
        console.log(`Received data for ${coin.name}:`, JSON.stringify(tokenData, null, 2));
        
        // Calculate price in SOL
        const price = tokenData.virtual_sol_reserves && tokenData.virtual_token_reserves
          ? tokenData.virtual_sol_reserves / tokenData.virtual_token_reserves
          : null;

        console.log(`Calculated new price for ${coin.name}: ${price} SOL`);
        
        updates.push(supabase
          .from('coins')
          .update({
            price: price,
            market_cap: tokenData.market_cap,
            usd_market_cap: tokenData.usd_market_cap,
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