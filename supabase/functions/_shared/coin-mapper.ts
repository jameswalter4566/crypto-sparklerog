import { CoinData, PumpApiResponse } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  console.log('Mapping coin data:', {
    mint: data.mint,
    name: data.name,
    virtualSolReserves: data.virtual_sol_reserves,
    virtualTokenReserves: data.virtual_token_reserves,
    usdMarketCap: data.usd_market_cap
  });

  // Calculate price in SOL using virtual reserves
  const priceInSol = data.virtual_sol_reserves && data.virtual_token_reserves
    ? (data.virtual_sol_reserves / 1e9) / (data.virtual_token_reserves / 1e9)
    : null;

  console.log('Calculated price in SOL:', priceInSol);

  // Calculate liquidity in SOL
  const liquidityInSol = data.virtual_sol_reserves
    ? data.virtual_sol_reserves / 1e9 // Convert lamports to SOL
    : null;

  console.log('Calculated liquidity in SOL:', liquidityInSol);

  return {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: priceInSol,
    change_24h: null, // We'll need historic data to calculate this
    market_cap: data.usd_market_cap || null,
    volume_24h: null, // Not provided in current API response
    liquidity: liquidityInSol,
    total_supply: data.total_supply ? data.total_supply / 1e9 : null,
    description: data.description,
    image_url: data.image_uri,
    solana_addr: data.mint,
    homepage: data.website || null,
    blockchain_site: null,
    official_forum_url: null,
    chat_url: data.telegram ? [data.telegram] : null,
    announcement_url: null,
    twitter_screen_name: data.twitter?.replace('https://x.com/', '') || null,
    historic_data: null // We'll need to implement this separately
  };
}