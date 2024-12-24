import { CoinData, PumpApiResponse } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  console.log('Mapping coin data for:', data.mint);
  console.log('Raw data from API:', {
    price: data.price,
    usd_market_cap: data.usd_market_cap,
    total_supply: data.total_supply,
    market_cap: data.market_cap,
    virtual_sol_reserves: data.virtual_sol_reserves,
    virtual_token_reserves: data.virtual_token_reserves
  });

  // Calculate liquidity in USD using virtual SOL reserves
  const solInUsd = 0.6; // Current approximate SOL price in USD
  const liquidityInUsd = data.virtual_sol_reserves 
    ? (data.virtual_sol_reserves / 1e9) * solInUsd // Convert lamports to SOL and multiply by USD price
    : null;

  // Calculate price in USD using virtual reserves
  const priceInUsd = data.usd_market_cap && data.total_supply
    ? data.usd_market_cap / (data.total_supply / 1e9)
    : null;

  // Use the provided USD market cap directly
  const marketCapUsd = data.usd_market_cap || null;

  console.log('Calculated values:', {
    priceInUsd,
    marketCapUsd,
    liquidityInUsd,
    totalSupply: data.total_supply / 1e9, // Convert to actual supply
    virtualSolReserves: data.virtual_sol_reserves / 1e9 // Convert to actual SOL
  });

  return {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: priceInUsd,
    change_24h: null, // We'll need to calculate this from historic data
    market_cap: marketCapUsd,
    volume_24h: null, // Not provided in current API response
    liquidity: liquidityInUsd,
    total_supply: data.total_supply / 1e9, // Convert to actual supply
    circulating_supply: null, // Not provided in current API response
    non_circulating_supply: null, // Not provided in current API response
    description: data.description,
    decimals: 9, // Standard for most SPL tokens
    image_url: data.image_uri,
    solana_addr: data.mint,
    historic_data: null // We'll need to implement this separately
  };
}