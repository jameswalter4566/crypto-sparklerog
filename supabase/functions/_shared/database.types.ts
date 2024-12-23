export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      coins: {
        Row: {
          id: string
          name: string
          symbol: string
          image_url: string | null
          price: number | null
          change_24h: number | null
          market_cap: number | null
          volume_24h: number | null
          liquidity: number | null
          updated_at: string | null
          coin_id: string | null
          solana_addr: string | null
          total_supply: number | null
          circulating_supply: number | null
          non_circulating_supply: number | null
          coingecko_id: string | null
          description: string | null
          decimals: number | null
          historic_data: Json | null
          homepage: string | null
          blockchain_site: string[] | null
          official_forum_url: string[] | null
          chat_url: string[] | null
          announcement_url: string[] | null
          twitter_screen_name: string | null
        }
      }
      profiles: {
        Row: {
          wallet_address: string
          display_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          last_profile_update: string | null
        }
      }
      voice_chat_users: {
        Row: {
          uid: number
          wallet_address: string | null
          created_at: string | null
        }
      }
    }
  }
}