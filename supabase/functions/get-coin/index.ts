import fetch from 'node-fetch'; // Ensure fetch is imported or available in your environment

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
    } = data;

    return {
      market_cap: market_cap?.usd || null,
    };
  } catch (err) {
    console.error("Error fetching main CoinGecko API:", err);
    return null;
  }
};

// HANDLER FUNCTION: Serve requests to get coin data
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const solana_addr = url.searchParams.get("solana_addr");

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

    // Fetch main CoinGecko data
    const mainData = coingecko_id ? await fetchMainCoinGeckoData(coingecko_id) : null;

    return new Response(
      JSON.stringify({ solana_addr, terminalData, mainData }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-coin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
