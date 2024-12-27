export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image_url: string | null;
  total_supply: number | null;
  price: number | null;
  change_24h: number | null;
  market_cap: number | null;
  usd_market_cap: number | null;
  volume_24h: number | null;
  liquidity: number | null;
  solana_addr: string | null;
  historic_data: Array<{ price: number; timestamp: string }> | null;
  circulating_supply: number | null;
  non_circulating_supply: number | null;
}

export interface CoinDataResponse {
  id: string;
  name: string;
  symbol: string;
  image_url: string | null;
  price: number | null;
  description: string | null;
  decimals: number | null;
  volume_24h: number | null;
  liquidity: number | null;
  solana_addr: string | null;
  total_supply: number | null;
  circulating_supply: number | null;
  non_circulating_supply: number | null;
  historic_data: Array<{ price: number; timestamp: string }> | null;
  homepage: string | null;
  twitter_screen_name: string | null;
  chat_url: string[] | null;
  announcement_url: string[] | null;
  market_cap: number | null;
  usd_market_cap: number | null;
  change_24h: number | null;
}