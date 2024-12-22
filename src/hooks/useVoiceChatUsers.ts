import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useVoiceChatUsers = (coinId: string) => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel(`coin_${coinId}_presence`, {
      config: {
        presence: {
          key: coinId,
        },
      },
    });

    const handleSync = () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      setUserCount(count);
    };

    channel
      .on('presence', { event: 'sync' }, handleSync)
      .on('presence', { event: 'join' }, handleSync)
      .on('presence', { event: 'leave' }, handleSync)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coinId]);

  return userCount;
};