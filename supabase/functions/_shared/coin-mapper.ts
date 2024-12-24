import { CoinData, PumpApiResponse } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  console.log('Mapping coin data for:', data.mint);
  console.log('Raw data from API:', {
    price: data.price,
    price_usd: data.price_usd,
    total_supply: data.total_supply,
    market_cap: data.market_cap,
    virtual_sol_reserves: data.virtual_sol_reserves
  });

  // Calculate market cap if we have both price and total supply
  const calculatedMarketCap = data.price_usd && data.total_supply 
    ? data.price_usd * data.total_supply 
    : null;

  console.log('Calculated market cap:', calculatedMarketCap);
  console.log('API provided market cap:', data.market_cap);

  return {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: data.price_usd || data.price, // Prefer USD price if available
    change_24h: data.price_change_24h,
    market_cap: calculatedMarketCap || data.market_cap || null,
    volume_24h: data.volume_24h,
    liquidity: data.virtual_sol_reserves,
    total_supply: data.total_supply,
    circulating_supply: data.circulating_supply,
    non_circulating_supply: data.non_circulating_supply,
    description: data.description,
    decimals: data.decimals,
    image_url: data.image_uri,
    solana_addr: data.mint,
    historic_data: data.price_history
  };
}