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

  // Calculate market cap using USD price and total supply
  const calculatedMarketCap = data.price_usd && data.total_supply 
    ? parseFloat((data.price_usd * data.total_supply).toFixed(2))
    : null;

  // Convert SOL values to USD where applicable
  const solPrice = data.price || 0;
  const usdPrice = data.price_usd || 0;
  const liquidityInUsd = data.virtual_sol_reserves ? parseFloat((data.virtual_sol_reserves * solPrice).toFixed(2)) : null;

  console.log('Calculated values:', {
    calculatedMarketCap,
    usdPrice,
    solPrice,
    liquidityInUsd
  });

  return {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: usdPrice,
    change_24h: data.price_change_24h,
    market_cap: calculatedMarketCap,
    volume_24h: data.volume_24h,
    liquidity: liquidityInUsd,
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