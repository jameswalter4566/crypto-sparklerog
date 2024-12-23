import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoinGeckoTerminalResponse {
  data?: {
    attributes?: {
      name: string;
      symbol: string;
      price: number;
      volume_24h: number;
      liquidity: number;
      total_supply: number;
      circulating_supply: number;
      non_circulating_supply: number;
      coingecko_coin_id: string | null;
      description: string | null;
      token_standard: string | null;
      decimals: number | null;
      image_url: string | null;
      market_cap: number | null;
    }
  }
}

interface CoinGeckoResponse {
  market_data?: {
    market_cap?: {
      usd?: number;
    };
    total_volume?: {
      usd?: number;
    };
    price_change_percentage_24h?: number;
  };
  links?: {
    homepage?: string[];
    blockchain_site?: string[];
    official_forum_url?: string[];
    chat_url?: string[];
    announcement_url?: string[];
    twitter_screen_name?: string;
  };
}

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

    // If we have a CoinGecko ID, fetch additional data from CoinGecko
    let coinGeckoData = null;
    if (attributes.coingecko_coin_id) {
      try {
        console.log('Fetching CoinGecko data for ID:', attributes.coingecko_coin_id);
        const geckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${attributes.coingecko_coin_id}?localization=false&tickers=false&community_data=false&developer_data=false`,
          {
            headers: {
              'accept': 'application/json',
              'x-cg-demo-api-key': 'CG-FPFWTmsu6NTuzHvntsXiRxJJ',
              'User-Agent': 'Solana Token Tracker/1.0'
            }
          }
        );

        if (geckoResponse.ok) {
          coinGeckoData = await geckoResponse.json() as CoinGeckoResponse;
          console.log('CoinGecko data:', JSON.stringify(coinGeckoData, null, 2));
        } else {
          console.error('Failed to fetch CoinGecko data:', await geckoResponse.text());
        }
      } catch (error) {
        console.error('Error fetching CoinGecko data:', error);
      }
    }

    // Calculate market cap with improved precision and fallback handling
    function calculateMarketCap(
      coinGeckoMarketCap: number | null | undefined,
      terminalMarketCap: number | null,
      price: number | null,
      circulatingSupply: number | null
    ): number | null {
      console.log('Calculating market cap with:', {
        coinGeckoMarketCap,
        terminalMarketCap,
        price,
        circulatingSupply
      });

      // Prefer CoinGecko data
      if (typeof coinGeckoMarketCap === 'number' && !isNaN(coinGeckoMarketCap)) {
        console.log('Using CoinGecko market cap:', coinGeckoMarketCap);
        return coinGeckoMarketCap;
      }

      // Use GeckoTerminal data
      if (typeof terminalMarketCap === 'number' && !isNaN(terminalMarketCap)) {
        console.log('Using GeckoTerminal market cap:', terminalMarketCap);
        return terminalMarketCap;
      }

      // Calculate from price and circulating supply
      if (typeof price === 'number' && 
          !isNaN(price) && 
          typeof circulatingSupply === 'number' && 
          !isNaN(circulatingSupply)) {
        const calculated = +(price * circulatingSupply).toFixed(2);
        console.log('Calculated market cap:', calculated);
        return calculated;
      }

      console.log('No valid market cap could be calculated');
      return null;
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const marketCap = calculateMarketCap(
      coinGeckoData?.market_data?.market_cap?.usd,
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
      homepage: coinGeckoData?.links?.homepage?.[0] || null,
      blockchain_site: coinGeckoData?.links?.blockchain_site || null,
      official_forum_url: coinGeckoData?.links?.official_forum_url || null,
      chat_url: coinGeckoData?.links?.chat_url || null,
      announcement_url: coinGeckoData?.links?.announcement_url || null,
      twitter_screen_name: coinGeckoData?.links?.twitter_screen_name || null,
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