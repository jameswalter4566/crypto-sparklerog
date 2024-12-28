import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DatabaseManager } from "../_shared/database-manager.ts";

const PUMP_API_URL = "https://frontend-api-v2.pump.fun/coins";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const db = new DatabaseManager();
    console.log('Polling Pump.fun for new coins...');

    const response = await fetch(PUMP_API_URL, {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Pump.fun: ${response.statusText}`);
    }

    const coins = await response.json();
    console.log(`Received ${coins.length} coins from Pump.fun`);

    let updatedCount = 0;
    for (const coin of coins) {
      try {
        await db.upsertCoin({
          id: coin.mint,
          name: coin.name,
          symbol: coin.symbol,
          description: coin.description,
          image_url: coin.image_uri,
          price: coin.price,
          change_24h: coin.price_change_24h,
          market_cap: coin.market_cap,
          volume_24h: coin.volume_24h,
          liquidity: coin.virtual_sol_reserves,
          total_supply: coin.total_supply,
          solana_addr: coin.mint,
          updated_at: new Date().toISOString()
        });
        updatedCount++;
      } catch (error) {
        console.error(`Error processing coin ${coin.mint}:`, error);
      }
    }

    console.log(`Successfully processed ${updatedCount} coins`);

    return new Response(
      JSON.stringify({ success: true, coinsProcessed: updatedCount }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in poll-new-coins:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});