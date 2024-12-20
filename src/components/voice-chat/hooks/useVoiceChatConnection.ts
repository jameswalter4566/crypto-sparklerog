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
      console.log("[Voice Chat Connection] Joining channel:", channelName);
      
      // Join the Agora channel
      const uid = await client.join(appId, channelName, null, undefined);
      console.log("[Voice Chat Connection] Joined channel with UID:", uid);

      console.log("[Voice Chat Connection] Publishing audio track");
      // Publish the audio track
      // Note: Publish expects ILocalTrack or ILocalTrack[], so we wrap the track in an array
      await client.publish([audioTrack]);
      console.log("[Voice Chat Connection] Published audio track successfully");

      setIsConnected(true);
      return uid;
    } catch (error) {
      console.error("[Voice Chat Connection] Error connecting:", error);
      throw error;
    }
  }, [client]);

  const disconnect = useCallback(async () => {
    if (!isConnected) {
      console.log("[Voice Chat Connection] Not connected to voice chat");
      return;
    }

    try {
      await client.leave();
      setIsConnected(false);
      console.log("[Voice Chat Connection] Left voice chat");
    } catch (error) {
      console.error("[Voice Chat Connection] Error leaving voice chat:", error);
      throw error;
    }
  }, [client, isConnected]);

  return {
    isConnected,
    connect,
    disconnect
  };
};
