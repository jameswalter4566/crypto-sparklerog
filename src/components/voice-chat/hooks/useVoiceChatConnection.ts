import { useState, useCallback } from 'react';
import type { IAgoraRTCClient } from 'agora-rtc-react';

export const useVoiceChatConnection = (client: IAgoraRTCClient) => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (channelName: string, appId: string) => {
    console.log("[Voice Chat Connection] Joining channel:", channelName);
    const uid = await client.join(appId, channelName, null, undefined);
    console.log("[Voice Chat Connection] Joined channel with UID:", uid);
    setIsConnected(true);
    return uid;
  }, [client]);

  const disconnect = useCallback(async () => {
    if (!isConnected) {
      console.log("[Voice Chat Connection] Not connected to voice chat");
      return;
    }

    await client.leave();
    setIsConnected(false);
    console.log("[Voice Chat Connection] Left voice chat");
  }, [client, isConnected]);

  return {
    isConnected,
    connect,
    disconnect
  };
};
