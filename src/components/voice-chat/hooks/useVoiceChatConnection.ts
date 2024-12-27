import { useState, useCallback } from 'react';
import type { IAgoraRTCClient } from 'agora-rtc-react';
import { toast } from 'sonner';

export const useVoiceChatConnection = (client: IAgoraRTCClient) => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (channelName: string, appId: string) => {
    try {
      console.log("[Voice Chat Connection] Joining channel:", channelName);
      if (!appId) {
        throw new Error("Agora App ID is required");
      }

      const uid = await client.join(appId, channelName, null, undefined);
      console.log("[Voice Chat Connection] Joined channel with UID:", uid);
      setIsConnected(true);
      return uid;
    } catch (error) {
      console.error("[Voice Chat Connection] Failed to join channel:", error);
      toast.error("Failed to connect to voice chat. Please try again.");
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
      toast.error("Error disconnecting from voice chat");
      throw error;
    }
  }, [client, isConnected]);

  return {
    isConnected,
    connect,
    disconnect
  };
};