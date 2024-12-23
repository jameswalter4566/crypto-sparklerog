import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const fetchTerminalData = async (solana_addr: string) => {
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
      {
        method: "GET",
        headers: { "accept": "application/json" },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch CoinGecko Terminal API. Status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.data?.attributes || null;
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
      console.warn(`Failed to fetch main CoinGecko API. Status: ${response.status}`);
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

const fetchMarketChartData = async (coingecko_id: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingecko_id}/market_chart?vs_currency=usd&days=7&precision=full`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
          "x-cg-demo-api-key": "CG-FPFWTmsu6NTuzHvntsXiRxJJ",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch market_chart data. Status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("Error fetching market_chart data:", err);
    return null;
  }
};

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get coin data from database
    const { data: coinData, error: fetchError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!coinData) {
      return new Response(
        JSON.stringify({ error: "Coin not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch fresh data from APIs
    const [terminalData, mainData, chartData] = await Promise.all([
      fetchTerminalData(id),
      coinData.coingecko_id ? fetchMainCoinGeckoData(coinData.coingecko_id) : null,
      coinData.coingecko_id ? fetchMarketChartData(coinData.coingecko_id) : null,
    ]);

    // Update database with fresh data
    if (terminalData || mainData) {
      const updateData = {
        ...coinData,
        ...(terminalData && {
          price: terminalData.price_usd,
          name: terminalData.name,
          symbol: terminalData.symbol,
          image_url: terminalData.image_url,
        }),
        ...(mainData && {
          market_cap: mainData.market_cap,
          homepage: mainData.homepage,
          blockchain_site: mainData.blockchain_site,
          official_forum_url: mainData.official_forum_url,
          chat_url: mainData.chat_url,
          announcement_url: mainData.announcement_url,
          twitter_screen_name: mainData.twitter_screen_name,
        }),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('coins')
        .upsert(updateData);

      if (updateError) {
        console.error('Error updating coin data:', updateError);
      }

      return new Response(
        JSON.stringify({
          data: {
            ...updateData,
            historic_data: chartData?.prices || null,
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Return existing data if no fresh data available
    return new Response(
      JSON.stringify({ data: coinData }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

export { fetchTerminalData, fetchMainCoinGeckoData, fetchMarketChartData };