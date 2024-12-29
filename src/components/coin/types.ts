export interface Comment {
  id: string;
  content: string;
  created_at: string;
  wallet_address: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}