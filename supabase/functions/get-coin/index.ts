import fetch from 'node-fetch'; // Ensure fetch is imported or available in your environment

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

    return await response.json();
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

export { fetchTerminalData, fetchMainCoinGeckoData, fetchMarketChartData };
