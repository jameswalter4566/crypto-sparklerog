import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";

export interface Stream {
  id: string;
  username: string;
  title: string;
  viewerCount: number;
  avatarUrl?: string | null;
}

export function useActiveStreams() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [realtimeStreams, setRealtimeStreams] = useState<Stream[]>([]);

  const { data: initialStreams, refetch } = useQuery({
    queryKey: ['active-streams'],
    queryFn: async () => {
      console.log('[useActiveStreams] Fetching active streams');
      
      try {
        const { data, error } = await supabase
          .from("active_streams")
          .select(`
            id,
            username,
            title,
            viewer_count,
            profiles (
              avatar_url
            )
          `);

        if (error) {
          console.error('[useActiveStreams] Error fetching streams:', error);
          throw error;
        }

        const formattedStreams = data.map((stream) => ({
          id: stream.id,
          username: stream.username,
          title: stream.title,
          viewerCount: stream.viewer_count,
          avatarUrl: stream.profiles?.avatar_url,
        }));

        console.log('[useActiveStreams] Fetched streams:', formattedStreams);
        setRealtimeStreams(formattedStreams);
        return formattedStreams;
      } catch (error) {
        console.error('[useActiveStreams] Error in query function:', error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (channelRef.current) {
      return;
    }

    console.log('[useActiveStreams] Setting up real-time subscription');
    
    channelRef.current = supabase
      .channel('active_streams_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_streams'
        },
        async (payload) => {
          console.log('[useActiveStreams] Received real-time update:', payload);
          
          // Fetch the complete updated data
          const { data: updatedData, error } = await supabase
            .from("active_streams")
            .select(`
              id,
              username,
              title,
              viewer_count,
              profiles (
                avatar_url
              )
            `);

          if (error) {
            console.error('[useActiveStreams] Error fetching updated streams:', error);
            return;
          }

          const formattedStreams = updatedData.map((stream) => ({
            id: stream.id,
            username: stream.username,
            title: stream.title,
            viewerCount: stream.viewer_count,
            avatarUrl: stream.profiles?.avatar_url,
          }));

          console.log('[useActiveStreams] Updated streams list:', formattedStreams);
          setRealtimeStreams(formattedStreams);
        }
      )
      .subscribe((status) => {
        console.log('[useActiveStreams] Subscription status:', status);
      });

    return () => {
      console.log('[useActiveStreams] Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return { 
    streams: realtimeStreams.length > 0 ? realtimeStreams : (initialStreams || []), 
    isLoading: !initialStreams 
  };
}