import { CoinData, PumpApiResponse } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  return {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: data.price,
    change_24h: data.price_change_24h,
    market_cap: data.market_cap,
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