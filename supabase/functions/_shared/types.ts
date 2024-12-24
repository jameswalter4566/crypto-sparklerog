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
  circulating_supply: number | null;
  non_circulating_supply: number | null;
  description: string | null;
  decimals: number | null;
  image_url: string | null;
  solana_addr: string | null;
  historic_data: Array<{
    price: number;
    timestamp: string;
  }> | null;
}

export interface PumpApiResponse {
  mint: string;
  name: string;
  symbol: string;
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  virtual_sol_reserves: number;
  total_supply: number;
  circulating_supply: number;
  non_circulating_supply: number;
  description: string;
  decimals: number;
  image_uri: string;
  price_history: Array<{
    price: number;
    timestamp: string;
  }>;
}

export interface CoinSearchParams {
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  includeNsfw?: boolean;
  captchaToken?: string;
}