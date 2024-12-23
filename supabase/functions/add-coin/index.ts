import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { calculateMarketCap } from "../_shared/market-cap.ts";
import { fetchCoinGeckoData } from "../_shared/coingecko.ts";
import { CoinGeckoTerminalResponse } from "../_shared/types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { solana_addr } = await req.json();
    
    if (!solana_addr) {
      throw new Error('Solana address is required');
    }

    console.log('Fetching data for Solana address:', solana_addr);

    // Fetch data from GeckoTerminal API
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
      {
        headers: { 
          'accept': 'application/json',
          'User-Agent': 'Solana Token Tracker/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('GeckoTerminal API error:', await response.text());
      throw new Error(`GeckoTerminal API error: ${response.status}`);
    }

    const data: CoinGeckoTerminalResponse = await response.json();
    console.log('GeckoTerminal response:', JSON.stringify(data, null, 2));
    
    const attributes = data?.data?.attributes;
    if (!attributes) {
      throw new Error('No token data found');
    }

    // Fetch CoinGecko Pro data
    const coinGeckoData = await fetchCoinGeckoData(solana_addr);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const marketCap = calculateMarketCap(
      coinGeckoData?.data?.market_data?.market_cap?.usd,
      attributes.market_cap,
      attributes.price,
      attributes.circulating_supply
    );

    console.log('Final market cap value:', marketCap);

    // Prepare coin data for database
    const coinData = {
      id: solana_addr,
      name: attributes.name,
      symbol: attributes.symbol,
      price: attributes.price,
      market_cap: marketCap,
      volume_24h: attributes.volume_24h,
      liquidity: attributes.liquidity,
      total_supply: attributes.total_supply,
      circulating_supply: attributes.circulating_supply,
      non_circulating_supply: attributes.non_circulating_supply,
      coingecko_id: attributes.coingecko_coin_id,
      description: attributes.description,
      decimals: attributes.decimals,
      image_url: attributes.image_url,
      solana_addr: solana_addr,
      homepage: coinGeckoData?.data?.links?.homepage?.[0] || null,
      blockchain_site: coinGeckoData?.data?.links?.blockchain_site || null,
      official_forum_url: coinGeckoData?.data?.links?.official_forum_url || null,
      chat_url: coinGeckoData?.data?.links?.chat_url || null,
      announcement_url: coinGeckoData?.data?.links?.announcement_url || null,
      twitter_screen_name: coinGeckoData?.data?.links?.twitter_screen_name || null,
      updated_at: new Date().toISOString()
    };

    // Insert or update coin data in database
    const { error: upsertError } = await supabaseClient
      .from('coins')
      .upsert(coinData);

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save coin data');
    }

    return new Response(
      JSON.stringify(coinData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
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