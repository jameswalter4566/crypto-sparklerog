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
  
  const maxRetries = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    try {
      const response = await fetch('https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/add-coin', {
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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to add coin after multiple attempts');
}

export async function getCoin(id: string): Promise<CoinData | null> {
  console.log('Fetching coin data for ID:', id);
  
  try {
    // First try to get from Supabase
    const { data: existingData, error: dbError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError) {
      console.error('Error fetching from database:', dbError);
    }

    // Fetch fresh data from the API
    const response = await fetch(`https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin?id=${id}`);
    
    if (!response.ok) {
      console.error('Error fetching from API:', await response.text());
      // Return existing data if we have it, otherwise null
      return existingData || null;
    }

    const freshData = await response.json();
    return freshData;
  } catch (error) {
    console.error('Error in getCoin:', error);
    return null;
  }
}

export async function getCoins(): Promise<CoinData[]> {
  console.log('Fetching all coins');
  
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('market_cap', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching coins:', error);
    return [];
  }

  console.log('Fetched coins:', data);
  return data || [];
}

// New function to setup real-time price updates
export function setupRealtimeUpdates(onUpdate: (coin: CoinData) => void) {
  const subscription = supabase
    .channel('coin_updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'coins',
      },
      (payload) => {
        console.log('Received real-time update:', payload);
        if (payload.new) {
          onUpdate(payload.new as CoinData);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}