import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const fetchCoinGeckoTerminalData = async (solana_addr: string) => {
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch CoinGecko Terminal API. Status: ${response.status}`);
      return null;
    }

    const coinData = await response.json();
    return coinData?.data?.attributes || null;
  } catch (err) {
    console.error("Error fetching CoinGecko Terminal API:", err);
    return null;
  }
};

const fetchMainCoinGeckoData = async (coingecko_id: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingecko_id}?localization=false`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
          "x-cg-demo-api-key": "CG-FPFWTmsu6NTuzHvntsXiRxJJ",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch main CoinGecko API. Status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Extract required fields
    const {
      market_data: { market_cap },
      links: {
        homepage,
        blockchain_site,
        official_forum_url,
        chat_url,
        announcement_url,
        twitter_screen_name,
      },
    } = data;

    return {
      market_cap: market_cap?.usd || null,
      homepage: homepage?.[0] || null,
      blockchain_site: blockchain_site?.filter((url) => url) || null,
      official_forum_url: official_forum_url?.filter((url) => url) || null,
      chat_url: chat_url?.filter((url) => url) || null,
      announcement_url: announcement_url?.filter((url) => url) || null,
      twitter_screen_name: twitter_screen_name || null,
    };
  } catch (err) {
    console.error("Error fetching main CoinGecko API:", err);
    return null;
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { solana_addr } = await req.json();
    
    if (!solana_addr) {
      return new Response(
        JSON.stringify({ error: "Solana address is required" }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const attributes = await fetchCoinGeckoTerminalData(solana_addr);
    if (!attributes) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch token data" }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const coingecko_id = attributes.coingecko_coin_id || null;
    let additionalData = null;
    
    if (coingecko_id) {
      additionalData = await fetchMainCoinGeckoData(coingecko_id);
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare data for insertion
    const coinData = {
      id: solana_addr,
      name: attributes.name,
      symbol: attributes.symbol,
      image_url: attributes.image_url,
      price: attributes.price_usd,
      market_cap: additionalData?.market_cap || null,
      coingecko_id: coingecko_id,
      homepage: additionalData?.homepage || null,
      blockchain_site: additionalData?.blockchain_site || null,
      official_forum_url: additionalData?.official_forum_url || null,
      chat_url: additionalData?.chat_url || null,
      announcement_url: additionalData?.announcement_url || null,
      twitter_screen_name: additionalData?.twitter_screen_name || null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('coins')
      .upsert(coinData);

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ success: true, data: coinData }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});