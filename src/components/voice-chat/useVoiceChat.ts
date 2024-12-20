import { useState, useCallback, useEffect } from 'react';
import { useClient } from 'agora-rtc-react';
import { UID } from 'agora-rtc-sdk-ng';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useRemoteUsers } from './hooks/useRemoteUsers';

export const useVoiceChat = (channelName: string) => {
  const client = useClient();
  const [isConnected, setIsConnected] = useState(false);
  
  const {
    localAudioTrack,
    isMuted,
    createLocalAudioTrack,
    toggleMute,
    cleanup: cleanupLocalAudio,
    getTrackForPublishing
  } = useLocalAudio();
  
  const {
    remoteUsers,
    handleUserJoined,
    handleUserLeft
  } = useRemoteUsers();

  const join = useCallback(async () => {
    if (isConnected) {
      console.log("Already connected to voice chat");
      return;
    }

    try {
      // Join the channel
      const uid = await client.join(
        "c6f7a2828b774baebabd8ece87268954",
        channelName,
        null,
        null
      );
      console.log("Joined voice chat with UID:", uid);

      // Create and publish local audio track
      const audioTrack = await createLocalAudioTrack();
      await client.publish(getTrackForPublishing());
      console.log("Published local audio track");

      setIsConnected(true);
    } catch (error) {
      console.error("Error joining voice chat:", error);
      cleanup();
      throw error;
    }
  }, [client, channelName, isConnected, createLocalAudioTrack, getTrackForPublishing]);

  const leave = useCallback(async () => {
    if (!isConnected) {
      console.log("Not connected to voice chat");
      return;
    }

    try {
      // Cleanup and leave
      cleanup();
      console.log("Left voice chat");
    } catch (error) {
      console.error("Error leaving voice chat:", error);
      throw error;
    }
  }, [isConnected]);

  const cleanup = useCallback(() => {
    cleanupLocalAudio();
    client.leave();
    setIsConnected(false);
  }, [client, cleanupLocalAudio]);

  useEffect(() => {
    // Set up event listeners
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      // Clean up event listeners
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [client, handleUserJoined, handleUserLeft]);

  return {
    isConnected,
    localAudioTrack,
    remoteUsers,
    isMuted,
    join,
    leave,
    toggleMute
  };
};