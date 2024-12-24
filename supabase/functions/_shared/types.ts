export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change_24h: number | null;
  market_cap: number | null;
  volume_24h: number | null;
  liquidity: number | null;
  total_supply: number | null;
  circulating_supply?: number | null;
  non_circulating_supply?: number | null;
  description: string | null;
  decimals?: number | null;
  image_url: string | null;
  solana_addr: string | null;
  historic_data: Array<{
    price: number;
    timestamp: string;
  }> | null;
  homepage: string | null;
  blockchain_site: string[] | null;
  official_forum_url: string[] | null;
  chat_url: string[] | null;
  announcement_url: string[] | null;
  twitter_screen_name: string | null;
}

export interface PumpApiResponse {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  market_cap: number;
  usd_market_cap: number;
  inverted: boolean;
  bonding_curve: string;
  raydium_pool: string;
}