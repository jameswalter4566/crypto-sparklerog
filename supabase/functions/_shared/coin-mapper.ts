// supabase/functions/_shared/coin-mapper.ts

import { CoinData, PumpApiResponse } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  console.log('Raw API data received:', {
    mint: data.mint,
    name: data.name,
    market_cap: data.market_cap,
    usd_market_cap: data.usd_market_cap,
    virtual_sol_reserves: data.virtual_sol_reserves,
    virtual_token_reserves: data.virtual_token_reserves
  });

  // Calculate price in SOL using virtual reserves
  let priceInSol: number | null = null;
  if (data.virtual_sol_reserves && data.virtual_token_reserves) {
    const solAmount = data.virtual_sol_reserves / 1e9; // Convert lamports to SOL
    const tokenAmount = data.virtual_token_reserves / 1e9; // Assuming 9 decimals
    priceInSol = solAmount / tokenAmount;
    console.log('Calculated price in SOL:', priceInSol);
  }

  // Calculate liquidity in SOL
  const liquidityInSol = data.virtual_sol_reserves
    ? data.virtual_sol_reserves / 1e9 // Convert lamports to SOL
    : null;
  console.log('Calculated liquidity in SOL:', liquidityInSol);

  // Ensure market cap values are numbers and not null
  const marketCap = typeof data.market_cap === 'number' ? data.market_cap : null;
  const usdMarketCap = typeof data.usd_market_cap === 'number' ? data.usd_market_cap : null;
  console.log('Market caps before mapping:', { marketCap, usdMarketCap });

  const mappedData: CoinData = {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,

    // Price derived from virtual reserves
    price: priceInSol,
    change_24h: null,

    // Market cap fields
    market_cap: marketCap,
    usd_market_cap: usdMarketCap,

    // Not provided in current API, so set to null or fill in if you have that data
    volume_24h: null,

    // Liquidity in SOL
    liquidity: liquidityInSol,

    // Convert total_supply from raw integer to a token amount if it has 9 decimals
    total_supply: data.total_supply ? data.total_supply / 1e9 : null,

    description: data.description,
    image_url: data.image_uri,
    solana_addr: data.mint,
    homepage: data.website || null,

    // The following fields can be updated based on your needs or left as is
    blockchain_site: null,
    official_forum_url: null,
    chat_url: data.telegram ? [data.telegram] : null,
    announcement_url: null,

    // If the token has a Twitter link, remove "https://x.com/" prefix
    twitter_screen_name: data.twitter?.replace('https://x.com/', '') || null,

    // If you want to store historical data, fill here; for now, null
    historic_data: null
  };

  console.log('Final mapped coin data:', mappedData);
  return mappedData;
}
