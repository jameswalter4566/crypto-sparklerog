import { supabase } from "@/integrations/supabase/client";

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
  coingecko_id: string | null;
  description: string | null;
  decimals: number | null;
  image_url: string | null;
  solana_addr: string | null;
  homepage: string | null;
  blockchain_site: string[] | null;
  official_forum_url: string[] | null;
  chat_url: string[] | null;
  announcement_url: string[] | null;
  twitter_screen_name: string | null;
}

export async function addCoin(solanaAddr: string): Promise<CoinData> {
  console.log('Adding coin with Solana address:', solanaAddr);
  
  const response = await fetch('/functions/v1/add-coin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ solana_addr: solanaAddr }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add coin');
  }

  const data = await response.json();
  console.log('Coin data received:', data);
  return data;
}

export async function getCoin(id: string): Promise<CoinData | null> {
  console.log('Fetching coin data for ID:', id);
  
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching coin:', error);
    return null;
  }

  console.log('Coin data from database:', data);
  return data;
}

export async function getCoins(): Promise<CoinData[]> {
  console.log('Fetching all coins');
  
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coins:', error);
    return [];
  }

  console.log('Fetched coins:', data);
  return data || [];
}