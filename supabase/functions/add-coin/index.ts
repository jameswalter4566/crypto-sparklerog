import fetch from 'node-fetch'; // Ensure fetch is imported or available in your environment

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

    return await response.json();
  } catch (err) {
    console.error("Error fetching main CoinGecko API:", err);
    return null;
  }
};

const solana_addr = "YOUR_SOLANA_ADDRESS"; // Replace with actual address
const attributes = await fetchCoinGeckoTerminalData(solana_addr);
const coingecko_id = attributes?.coingecko_coin_id || null;

if (coingecko_id) {
  const coinGeckoData = await fetchMainCoinGeckoData(coingecko_id);
  console.log("CoinGecko Main Data:", coinGeckoData);
} else {
  console.warn("No coingecko_id found in Terminal API data.");
}
