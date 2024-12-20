import { useState, useCallback } from 'react';
import type { IAgoraRTCClient, ILocalTrack } from 'agora-rtc-react';

export const useVoiceChatConnection = (client: IAgoraRTCClient) => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (
    channelName: string, 
    appId: string,
    audioTrack: ILocalTrack
  ) => {
    try {
      console.log("[Voice Chat] Joining channel:", channelName);
      const uid = await client.join(appId, channelName, null, undefined);
      console.log("[Voice Chat] Joined channel with UID:", uid);

      console.log("[Voice Chat] Publishing audio track");
      await client.publish(audioTrack);
      console.log("[Voice Chat] Published audio track successfully");

      setIsConnected(true);
      return uid;
    } catch (error) {
      console.error("[Voice Chat] Error connecting:", error);
      throw error;
    }
  }, [client]);

  const disconnect = useCallback(async () => {
    if (!isConnected) {
      console.log("[Voice Chat] Not connected to voice chat");
      return;
    }

    try {
      await client.leave();
      setIsConnected(false);
      console.log("[Voice Chat] Left voice chat");
    } catch (error) {
      console.error("[Voice Chat] Error leaving voice chat:", error);
      throw error;
    }
  }, [client, isConnected]);

  return {
    isConnected,
    connect,
    disconnect
  };
};