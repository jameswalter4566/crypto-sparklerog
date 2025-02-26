export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_streams: {
        Row: {
          created_at: string | null
          id: string
          title: string
          username: string
          viewer_count: number | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id: string
          title: string
          username: string
          viewer_count?: number | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          username?: string
          viewer_count?: number | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_streams_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      coin_comments: {
        Row: {
          coin_id: string
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          coin_id: string
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          coin_id?: string
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_comments_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_comments_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      coin_searches: {
        Row: {
          coin_id: string
          id: string
          last_searched_at: string | null
          search_count: number | null
        }
        Insert: {
          coin_id: string
          id?: string
          last_searched_at?: string | null
          search_count?: number | null
        }
        Update: {
          coin_id?: string
          id?: string
          last_searched_at?: string | null
          search_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coin_searches_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: true
            referencedRelation: "coins"
            referencedColumns: ["id"]
          },
        ]
      }
      coins: {
        Row: {
          announcement_url: string[] | null
          blockchain_site: string[] | null
          change_24h: number | null
          chat_url: string[] | null
          circulating_supply: number | null
          coin_id: string | null
          coingecko_id: string | null
          decimals: number | null
          description: string | null
          historic_data: Json | null
          homepage: string | null
          id: string
          image_url: string | null
          liquidity: number | null
          market_cap: number | null
          name: string
          non_circulating_supply: number | null
          official_forum_url: string[] | null
          price: number | null
          solana_addr: string | null
          symbol: string
          total_supply: number | null
          twitter_screen_name: string | null
          updated_at: string | null
          usd_market_cap: number | null
          volume_24h: number | null
        }
        Insert: {
          announcement_url?: string[] | null
          blockchain_site?: string[] | null
          change_24h?: number | null
          chat_url?: string[] | null
          circulating_supply?: number | null
          coin_id?: string | null
          coingecko_id?: string | null
          decimals?: number | null
          description?: string | null
          historic_data?: Json | null
          homepage?: string | null
          id: string
          image_url?: string | null
          liquidity?: number | null
          market_cap?: number | null
          name: string
          non_circulating_supply?: number | null
          official_forum_url?: string[] | null
          price?: number | null
          solana_addr?: string | null
          symbol: string
          total_supply?: number | null
          twitter_screen_name?: string | null
          updated_at?: string | null
          usd_market_cap?: number | null
          volume_24h?: number | null
        }
        Update: {
          announcement_url?: string[] | null
          blockchain_site?: string[] | null
          change_24h?: number | null
          chat_url?: string[] | null
          circulating_supply?: number | null
          coin_id?: string | null
          coingecko_id?: string | null
          decimals?: number | null
          description?: string | null
          historic_data?: Json | null
          homepage?: string | null
          id?: string
          image_url?: string | null
          liquidity?: number | null
          market_cap?: number | null
          name?: string
          non_circulating_supply?: number | null
          official_forum_url?: string[] | null
          price?: number | null
          solana_addr?: string | null
          symbol?: string
          total_supply?: number | null
          twitter_screen_name?: string | null
          updated_at?: string | null
          usd_market_cap?: number | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          last_profile_update: string | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          last_profile_update?: string | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          last_profile_update?: string | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      server_channels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      server_messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string | null
          id: string
          wallet_address: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          wallet_address?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "server_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "server_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_messages_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      stream_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          stream_id: string
          username: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          stream_id: string
          username: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          stream_id?: string
          username?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "active_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_messages_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      voice_chat_users: {
        Row: {
          created_at: string | null
          uid: number
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          uid: number
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          uid?: number
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_chat_users_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_viewer_count: {
        Args: {
          stream_id_param: string
        }
        Returns: undefined
      }
      get_secret: {
        Args: {
          secret_name: string
        }
        Returns: {
          secret: string
        }[]
      }
      increment_viewer_count: {
        Args: {
          stream_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
