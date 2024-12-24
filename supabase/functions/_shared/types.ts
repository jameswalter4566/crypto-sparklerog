// supabase/functions/_shared/types.ts

export interface PumpApiResponse {
  mint: string;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  video_uri?: string | null;
  metadata_uri?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  bonding_curve?: string | null;
  associated_bonding_curve?: string | null;
  creator?: string | null;
  created_timestamp?: number | null;
  raydium_pool?: string | null;
  complete?: boolean;
  virtual_sol_reserves?: number | null;
  virtual_token_reserves?: number | null;
  total_supply?: number | null;
  website?: string | null;
  show_name?: boolean | null;
  king_of_the_hill_timestamp?: number | null;
  market_cap?: number;
  reply_count?: number | null;
  last_reply?: number | null;
  nsfw?: boolean;
  market_id?: string | null;
  inverted?: boolean | null;
  is_currently_live?: boolean | null;
  username?: string | null;
  profile_image?: string | null;
  usd_market_cap?: number;
}

export interface CoinData {
  id: string;
  name?: string;
  symbol?: string;
  description?: string;
  image_url?: string;
  video_uri?: string | null;
  metadata_uri?: string | null;
  twitter_screen_name?: string | null;
  telegram?: string | null;
  bonding_curve?: string | null;
  associated_bonding_curve?: string | null;
  creator?: string | null;
  created_timestamp?: number | null;
  raydium_pool?: string | null;
  complete?: boolean;
  virtual_sol_reserves?: number | null;
  virtual_token_reserves?: number | null;
  total_supply?: number | null;
  website?: string | null;
  show_name?: boolean | null;
  king_of_the_hill_timestamp?: number | null;
  reply_count?: number | null;
  last_reply?: number | null;
  nsfw?: boolean;
  market_id?: string | null;
  inverted?: boolean | null;
  is_currently_live?: boolean | null;
  username?: string | null;
  profile_image?: string | null;
  
  market_cap?: number | null;
  usd_market_cap?: number | null;
  price?: number | null;
  change_24h?: number | null;
  volume_24h?: number | null;
  liquidity?: number | null;
  circulating_supply?: number | null;
  decimals?: number | null;

  homepage?: string | null;
  blockchain_site?: string[];
  chat_url?: string[];
  coingecko_id?: string | null;
  non_circulating_supply?: number | null;
  announcement_url?: string | null;
  official_forum_url?: string | null;
  
  updated_at?: string;
  solana_addr?: string;
  historic_data?: any; // or a more specific type
}
