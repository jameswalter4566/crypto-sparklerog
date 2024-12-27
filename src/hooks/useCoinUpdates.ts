import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

interface RealtimeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change_24h: number | null;
  image_url: string | null;
}

export function useCoinUpdates(queryClient: QueryClient) {
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up real-time subscription');
    
    const channel = supabase.channel('coin_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coins'
        },
        (payload: RealtimePostgresChangesPayload<RealtimeCoin>) => {
          console.log('Received real-time update:', payload);
          
          // Invalidate and refetch the trending-coins query
          queryClient.invalidateQueries({ queryKey: ['trending-coins'] });
          
          if (payload.new && 'name' in payload.new) {
            toast({
              title: "Price Update",
              description: `${payload.new.name}'s price has been updated.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
}