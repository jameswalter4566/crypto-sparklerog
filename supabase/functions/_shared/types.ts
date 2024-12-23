export interface CoinGeckoTerminalResponse {
  data?: {
    attributes?: {
      name: string;
      symbol: string;
      price: number;
      volume_24h: number;
      liquidity: number;
      total_supply: number;
      circulating_supply: number;
      non_circulating_supply: number;
      coingecko_coin_id: string | null;
      description: string | null;
      token_standard: string | null;
      decimals: number | null;
      image_url: string | null;
      market_cap: number | null;
    }
  }
}

export interface CoinGeckoProResponse {
  data?: {
    market_data?: {
      market_cap?: {
        usd?: number;
      };
      total_volume?: {
        usd?: number;
      };
      price_change_percentage_24h?: number;
    };
    links?: {
      homepage?: string[];
      blockchain_site?: string[];
      official_forum_url?: string[];
      chat_url?: string[];
      announcement_url?: string[];
      twitter_screen_name?: string;
    };
  }
}