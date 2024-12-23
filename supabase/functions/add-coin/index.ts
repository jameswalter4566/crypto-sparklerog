// CoinGecko Terminal API integration
const coingeckoResponse = await fetch(
  `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
  {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  }
);

// Extract CoinGecko data
const coinData = await coingeckoResponse.json();
const attributes = coinData.data.attributes;
const coingecko_id = attributes.coingecko_coin_id || null;

// Fetch market cap if coingecko_id exists
let marketCap = null;
if (coingecko_id) {
  try {
    const coingeckoApiResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingecko_id}?localization=false`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-cg-demo-api-key": "CG-FPFWTmsu6NTuzHvntsXiRxJJ",
        },
      }
    );

    if (coingeckoApiResponse.ok) {
      const coingeckoData = await coingeckoApiResponse.json();
      marketCap = coingeckoData?.market_data?.market_cap?.usd || null;
    } else {
      console.warn(`Failed to fetch CoinGecko data. Status: ${coingeckoApiResponse.status}`);
    }
  } catch (error) {
    console.error("Error fetching market cap from CoinGecko:", error);
  }
}

console.log("Market Cap:", marketCap);
