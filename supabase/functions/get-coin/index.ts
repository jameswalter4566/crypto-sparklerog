// get-coin/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define the handler
Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Coin ID is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Query the 'coins' table for the given id
    const { data: coin, error: fetchError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: Row not found
      console.error('Error fetching coin from database:', fetchError);
      return new Response(JSON.stringify({ error: 'Error fetching coin data.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!coin) {
      return new Response(JSON.stringify({ error: 'Coin does not exist.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check 'updated_at' timestamp
    const updatedAt = new Date(coin.updated_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);

    if (diffInMinutes < 2) {
      // Return the data as is
      return new Response(JSON.stringify({ data: coin }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Need to update data
    let updatedData = { ...coin };
    let needToUpdate = false;

    // Helper Functions
    const fetchTerminalData = async (solana_addr: string) => {
      try {
        const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });

        if (!response.ok) {
          console.warn('Failed to fetch CoinGecko Terminal API data.');
          return null;
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error fetching CoinGecko Terminal API:', err);
        return null;
      }
    };

    const fetchMainCoinGeckoData = async (coingecko_id: string) => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coingecko_id}?localization=false`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-cg-demo-api-key': 'CG-FPFWTmsu6NTuzHvntsXiRxJJ', // Use env variable
          },
        });

        if (!response.ok) {
          console.warn('Failed to fetch main CoinGecko API data.');
          return null;
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error fetching main CoinGecko API:', err);
        return null;
      }
    };

    const fetchMarketChartData = async (coingecko_id: string) => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coingecko_id}/market_chart?vs_currency=usd&days=7&precision=full`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-cg-demo-api-key': 'CG-FPFWTmsu6NTuzHvntsXiRxJJ',
          },
        });

        if (!response.ok) {
          console.warn('Failed to fetch market_chart data.');
          return null;
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error fetching market_chart data:', err);
        return null;
      }
    };

    const isTimestampYesterday = (timestamp: number) => {
      const date = new Date(timestamp);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      );
    };

    // Update Logic
    if (!coin.coingecko_id) {
      // Fetch from Terminal API
      const terminalData = await fetchTerminalData(coin.id);

      if (terminalData) {
        const attrs = terminalData.data.attributes;
        if (attrs.coingecko_coin_id) {
          updatedData.coingecko_id = attrs.coingecko_coin_id;

          // Fetch main CoinGecko API data
          const mainApiData = await fetchMainCoinGeckoData(attrs.coingecko_coin_id);
          if (mainApiData && mainApiData.market_data) {
            const marketData = mainApiData.market_data;
            updatedData.price = marketData.current_price.usd || coin.price;
            updatedData.volume_24h = marketData.total_volume.usd || coin.volume_24h;
            updatedData.market_cap = marketData.market_cap.usd || coin.market_cap;
            updatedData.change_24h = marketData.price_change_percentage_24h || coin.change_24h;
            updatedData.circulating_supply = marketData.circulating_supply || coin.circulating_supply;
            updatedData.non_circulating_supply = marketData.total_supply - (marketData.circulating_supply || 0);

            // Fetch historic data
            const marketChartData = await fetchMarketChartData(attrs.coingecko_coin_id);
            if (marketChartData && Array.isArray(marketChartData.prices)) {
              updatedData.historic_data = marketChartData.prices;
            }
            needToUpdate = true;
          }
        } else {
          // coingecko_id is still not available, update available data
          if (attrs.price_usd) {
            updatedData.price = Number(attrs.price_usd);
          }
          if (attrs.volume_usd?.h24) {
            updatedData.volume_24h = Number(attrs.volume_usd.h24);
          }
          if (attrs.market_cap_usd) {
            updatedData.market_cap = Number(attrs.market_cap_usd);
          }
          needToUpdate = true;
        }
      }
    } else {
      // coingecko_id is present, fetch main CoinGecko API data
      const mainApiData = await fetchMainCoinGeckoData(coin.coingecko_id);

      if (mainApiData && mainApiData.market_data) {
        const marketData = mainApiData.market_data;
        updatedData.price = marketData.current_price.usd || coin.price;
        updatedData.volume_24h = marketData.total_volume.usd || coin.volume_24h;
        updatedData.market_cap = marketData.market_cap.usd || coin.market_cap;
        updatedData.change_24h = marketData.price_change_percentage_24h || coin.change_24h;
        updatedData.circulating_supply = marketData.circulating_supply || coin.circulating_supply;
        updatedData.non_circulating_supply = marketData.total_supply - (marketData.circulating_supply || 0);

        // Check if historic_data exists
        if (coin.historic_data && Array.isArray(coin.historic_data) && coin.historic_data.length > 0) {
          const firstPriceEntry = coin.historic_data[0];
          const firstTimestamp = firstPriceEntry[0]; // [timestamp, price]

          if (isTimestampYesterday(firstTimestamp)) {
            // Fetch updated market_chart data
            const marketChartData = await fetchMarketChartData(coin.coingecko_id);
            if (marketChartData && Array.isArray(marketChartData.prices)) {
              updatedData.historic_data = marketChartData.prices;
              needToUpdate = true;
            }
          }
        } else {
          // historic_data is not available, fetch it
          const marketChartData = await fetchMarketChartData(coin.coingecko_id);
          if (marketChartData && Array.isArray(marketChartData.prices)) {
            updatedData.historic_data = marketChartData.prices;
            needToUpdate = true;
          }
        }

        needToUpdate = true;
      }
    }

    if (needToUpdate) {
      // Update the 'updated_at' timestamp
      updatedData.updated_at = now.toISOString();

      // Remove any fields that are undefined or null to prevent unintended overwrites
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] === undefined || updatedData[key] === null) {
          delete updatedData[key];
        }
      });

      console.log('updated data: ', updatedData)

      // Update the 'coins' table
      const { data: updatedCoin, error: updateError } = await supabase
        .from('coins')
        .update(updatedData)
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error updating coin data in database:', updateError);
        return new Response(JSON.stringify({ error: 'Error updating coin data.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Return the updated data
      return new Response(JSON.stringify({ data: updatedCoin }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // No update needed, return existing data
      return new Response(JSON.stringify({ data: coin }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
