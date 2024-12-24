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
  const priceInSol = data.virtual_sol_reserves && data.virtual_token_reserves
    ? (data.virtual_sol_reserves / 1e9) / (data.virtual_token_reserves / 1e9)
    : null;

  console.log('Calculated price in SOL:', priceInSol);

  // Calculate liquidity in SOL
  const liquidityInSol = data.virtual_sol_reserves
    ? data.virtual_sol_reserves / 1e9 // Convert lamports to SOL
    : null;

  console.log('Calculated liquidity in SOL:', liquidityInSol);

  // Prioritize USD market cap, fall back to regular market cap
  const marketCap = data.usd_market_cap || data.market_cap || null;
  console.log('Final market cap value:', marketCap);

  const mappedData: CoinData = {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: priceInSol,
    change_24h: null, // We'll need historic data to calculate this
    market_cap: marketCap, // Using USD market cap as primary market cap value
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
    historic_data: null, // We'll need to implement this separately
    usd_market_cap: data.usd_market_cap || null // Keep this for reference
  };

  console.log('Mapped coin data:', mappedData);
  return mappedData;
}