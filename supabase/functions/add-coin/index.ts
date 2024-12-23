// Remove node-fetch import as fetch is globally available in Deno
// Import necessary types
interface TerminalData {
  name: string;
  symbol: string;
  price: number;
  total_supply: number;
  coingecko_coin_id: string;
  [key: string]: any;
}

// HELPER FUNCTION: Fetch terminal data from CoinGecko Terminal API
const fetchTerminalData = async (solana_addr: string) => {
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
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

// HELPER FUNCTION: Fetch detailed main CoinGecko data
const fetchMainCoinGeckoData = async (coingecko_id: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingecko_id}?localization=false`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
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
      blockchain_site: blockchain_site?.filter((url: string) => url) || null,
      official_forum_url: official_forum_url?.filter((url: string) => url) || null,
      chat_url: chat_url?.filter((url: string) => url) || null,
      announcement_url: announcement_url?.filter((url: string) => url) || null,
      twitter_screen_name: twitter_screen_name || null,
    };
  } catch (err) {
    console.error("Error fetching main CoinGecko API:", err);
    return null;
  }
};

// HANDLER FUNCTION: Serve requests and combine data
Deno.serve(async (req) => {
  try {
    // Parse the request body for POST requests
    const { solana_addr } = await req.json();

    if (!solana_addr) {
      return new Response(
        JSON.stringify({ error: "Solana address is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch terminal data
    const terminalData = await fetchTerminalData(solana_addr);
    if (!terminalData) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch terminal data" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const coingecko_id = terminalData.coingecko_coin_id || null;

    // Fetch additional data if coingecko_id exists
    const mainData = coingecko_id ? await fetchMainCoinGeckoData(coingecko_id) : null;

    // Combine all fetched data
    const responseData = {
      solana_addr,
      terminalData,
      mainData,
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in add-coin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Export functions for reuse
export { fetchTerminalData, fetchMainCoinGeckoData };