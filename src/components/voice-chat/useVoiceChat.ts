import { useCallback, useEffect } from 'react';
import { useRTCClient } from 'agora-rtc-react';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useParticipants } from './hooks/useParticipants';
import { useVoiceChatConnection } from './hooks/useVoiceChatConnection';

interface UseVoiceChatProps {
  channelName: string;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  agoraAppId: string;
  microphoneId?: string;
}

export const useVoiceChat = ({
  channelName,
  userProfile,
  agoraAppId,
  microphoneId
}: UseVoiceChatProps) => {
  const client = useRTCClient();
  const {
    localAudioTrack,
    isMuted,
    createLocalAudioTrack,
    toggleMute,
    cleanup: cleanupLocalAudio
  } = useLocalAudio(microphoneId);

  const {
    participants,
    addLocalParticipant,
    addRemoteParticipant,
    removeParticipant,
    handleToggleMute,
    clearParticipants
  } = useParticipants();

  const {
    isConnected,
    connect,
    disconnect
  } = useVoiceChatConnection(client);

  const join = useCallback(async () => {
    if (isConnected) {
      console.log("[Voice Chat] Already connected to voice chat");
      return;
    }

    try {
      const audioTrack = await createLocalAudioTrack();
      if (!audioTrack) {
        throw new Error("Failed to create audio track");
      }

      const uid = await connect(channelName, agoraAppId, audioTrack);
      addLocalParticipant(Number(uid), userProfile);
      console.log("[Voice Chat] Successfully connected to voice chat");
    } catch (error) {
      console.error("[Voice Chat] Error joining voice chat:", error);
      cleanupLocalAudio();
      throw error;
    }
  }, [isConnected, connect, channelName, agoraAppId, createLocalAudioTrack, cleanupLocalAudio, addLocalParticipant, userProfile]);

  const leave = useCallback(async () => {
    try {
      await disconnect();
      cleanupLocalAudio();
      clearParticipants();
    } catch (error) {
      console.error("[Voice Chat] Error leaving voice chat:", error);
      throw error;
    }
  }, [disconnect, cleanupLocalAudio, clearParticipants]);

  // Set up event listeners for user join/leave
  useEffect(() => {
    console.log("[Voice Chat] Setting up voice chat event listeners");
    
    const handleUserJoined = (user: any) => {
      addRemoteParticipant(Number(user.uid));
    };

    const handleUserLeft = (user: any) => {
      removeParticipant(Number(user.uid));
    };

    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // Enable volume indicator for talking state
    client.enableAudioVolumeIndicator();

    return () => {
      console.log("[Voice Chat] Cleaning up voice chat event listeners");
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [client, addRemoteParticipant, removeParticipant]);

  return {
    isConnected,
    localAudioTrack,
    isMuted,
    participants,
    handleToggleMute,
    join,
    leave,
    toggleMute
  };
};