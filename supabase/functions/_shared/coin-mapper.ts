/**
 * Maps PumpApiResponse -> CoinData
 */
import { PumpApiResponse, CoinData } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  console.log('Raw API data received:', {
    mint: data.mint,
    name: data.name,
    market_cap: data.market_cap,
    usd_market_cap: data.usd_market_cap,
    virtual_sol_reserves: data.virtual_sol_reserves,
    virtual_token_reserves: data.virtual_token_reserves
  });

  // Convert market_cap to number or null
  const marketCap = typeof data.market_cap === 'number' ? data.market_cap : null;
  const usdMarketCap = typeof data.usd_market_cap === 'number' ? data.usd_market_cap : null;

  // Calculate price in SOL (if applicable)
  // (Optional logic, if you have it)
  // e.g., priceInSol = (data.virtual_sol_reserves / 1e9) / (data.virtual_token_reserves / 1e9);

  const mappedData: CoinData = {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    image_url: data.image_uri || null,
    description: data.description || null,

    // If you do the SOL price calculation, put it here
    price: null,

    change_24h: null,
    market_cap: marketCap,         // This is the "SOL" market cap from Pump.fun
    usd_market_cap: usdMarketCap,  // This is the USD market cap from Pump.fun
    volume_24h: null,
    liquidity: data.virtual_sol_reserves || null, // Or another approach for liquidity
    total_supply: data.total_supply || null,
    circulating_supply: null, // Not provided by Pump.fun (set it if available)
    // If you track last update time
    updated_at: new Date().toISOString(),

    solana_addr: data.mint,
    decimals: null,
    historic_data: null,
    homepage: data.website || null,
    blockchain_site: [],
    chat_url: data.telegram ? [data.telegram] : [],
    twitter_screen_name: data.twitter || null,
    coingecko_id: null,
    non_circulating_supply: null,
    announcement_url: null,
    official_forum_url: null
  };

  console.log('Final mapped coin data:', mappedData);
  return mappedData;
}
