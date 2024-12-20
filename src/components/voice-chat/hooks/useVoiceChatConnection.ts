import { useState, useCallback } from 'react';
import type { IAgoraRTCClient, ILocalTrack } from 'agora-rtc-react';

export const useVoiceChatConnection = (client: IAgoraRTCClient) => {
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Connect to the given channel using the specified App ID, then publish the provided track.
   */
  const connect = useCallback(async (channelName: string, appId: string, track: ILocalTrack) => {
    console.log("[Voice Chat Connection] Joining channel:", channelName);
    const uid = await client.join(appId, channelName, null, undefined);
    console.log("[Voice Chat Connection] Joined channel with UID:", uid);

    console.log("[Voice Chat Connection] Publishing audio track");
    await client.publish([track]);
    console.log("[Voice Chat Connection] Published audio track successfully");

    setIsConnected(true);
    return uid;
  }, [client]);

  /**
   * Disconnect from the channel if currently connected.
   */
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
