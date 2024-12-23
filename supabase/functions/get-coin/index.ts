import { createClient } from '@supabase/supabase-js';
import { Database } from '../_shared/database.types';

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
    };
  };
}

// HELPER FUNCTION: Fetch terminal data from CoinGecko Terminal API
const fetchTerminalData = async (solana_addr: string): Promise<any> => {
  try {
    console.log('Fetching Terminal data for:', solana_addr);
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
      {
        headers: { accept: 'application/json' },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch Terminal data. Status: ${response.status}`);
      return null;
    }

    const data: CoinGeckoTerminalResponse = await response.json();
    console.log('Terminal data received:', data);
    return data?.data?.attributes || null;
  } catch (err) {
    console.error('Error fetching Terminal data:', err);
    return null;
  }
};

// HELPER FUNCTION: Fetch detailed CoinGecko data
const fetchCoinGeckoData = async (coingecko_id: string): Promise<any> => {
  if (!coingecko_id) return null;
  
  try {
    console.log('Fetching CoinGecko data for:', coingecko_id);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingecko_id}?localization=false&tickers=false&community_data=false&developer_data=false`,
      {
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': 'CG-FPFWTmsu6NTuzHvntsXiRxJJ',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch CoinGecko data. Status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('CoinGecko data received:', data);
    
    return {
      market_cap: data.market_data?.market_cap?.usd || null,
      total_volume: data.market_data?.total_volume?.usd || null,
      price_change_24h: data.market_data?.price_change_percentage_24h || null,
    };
  } catch (err) {
    console.error('Error fetching CoinGecko data:', err);
    return null;
  }
};

// Main handler function
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error('Token ID is required');
    }

    console.log('Processing request for token:', id);

    // First try to get data from our database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { data: dbCoin, error: dbError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch token data');
    }

    // Fetch fresh data from Terminal API
    const terminalData = await fetchTerminalData(dbCoin?.solana_addr || id);
    if (!terminalData) {
      throw new Error('Failed to fetch token data from Terminal API');
    }

    // Fetch additional data from CoinGecko if available
    const coingeckoData = terminalData.coingecko_coin_id
      ? await fetchCoinGeckoData(terminalData.coingecko_coin_id)
      : null;

    // Combine all data sources
    const combinedData = {
      terminalData: {
        ...terminalData,
        price: parseFloat(terminalData.price) || null,
        volume_24h: parseFloat(terminalData.volume_24h) || null,
        liquidity: parseFloat(terminalData.liquidity) || null,
        total_supply: parseFloat(terminalData.total_supply) || null,
        circulating_supply: parseFloat(terminalData.circulating_supply) || null,
        non_circulating_supply: parseFloat(terminalData.non_circulating_supply) || null,
      },
      mainData: coingeckoData,
    };

    // Update our database with the latest data
    if (dbCoin) {
      const { error: updateError } = await supabase
        .from('coins')
        .update({
          price: combinedData.terminalData.price,
          market_cap: coingeckoData?.market_cap || null,
          volume_24h: combinedData.terminalData.volume_24h,
          liquidity: combinedData.terminalData.liquidity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating database:', updateError);
      }
    }

    return new Response(JSON.stringify(combinedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-coin function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      {
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});