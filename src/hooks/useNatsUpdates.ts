import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { CoinData } from "@/data/mockCoins";

export const useNatsUpdates = (initialCoins: CoinData[]) => {
  const [coins, setCoins] = useState<CoinData[]>(initialCoins);

  useEffect(() => {
    // Set up real-time channel subscription
    const channel = supabase.channel('coin_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coins'
        },
        (payload) => {
          console.log('Received coin update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setCoins(prevCoins => [payload.new as CoinData, ...prevCoins]);
          } else if (payload.eventType === 'UPDATE') {
            setCoins(prevCoins => 
              prevCoins.map(coin => 
                coin.id === payload.new.id ? { ...coin, ...payload.new } : coin
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCoins(prevCoins => 
              prevCoins.filter(coin => coin.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return coins;
};