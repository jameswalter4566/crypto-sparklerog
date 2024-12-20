import { useCallback, useEffect, useState } from 'react';
import { useRTCClient } from 'agora-rtc-react';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useParticipants } from './hooks/useParticipants';
import { useVoiceChatConnection } from './hooks/useVoiceChatConnection';
import type { IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

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
  const [localUid, setLocalUid] = useState<number | null>(null);

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

      console.log("[Voice Chat] Connecting to channel:", channelName);
      const uid = await connect(channelName, agoraAppId, audioTrack as IMicrophoneAudioTrack);
      const uidNumber = Number(uid);
      setLocalUid(uidNumber);

      console.log("[Voice Chat] Publishing local audio track");
      await client.publish(audioTrack);
      console.log("[Voice Chat] Published audio track successfully");

      addLocalParticipant(uidNumber, userProfile);
      console.log("[Voice Chat] Successfully connected to voice chat with UID:", uidNumber);
    } catch (error) {
      console.error("[Voice Chat] Error joining voice chat:", error);
      cleanupLocalAudio();
      throw error;
    }
  }, [isConnected, connect, channelName, agoraAppId, createLocalAudioTrack, cleanupLocalAudio, addLocalParticipant, userProfile, client]);

  const leave = useCallback(async () => {
    try {
      if (localAudioTrack) {
        console.log("[Voice Chat] Unpublishing local audio track before leaving");
        await client.unpublish(localAudioTrack);
      }
      await disconnect();
      cleanupLocalAudio();
      clearParticipants();
      setLocalUid(null);
      console.log("[Voice Chat] Left voice chat");
    } catch (error) {
      console.error("[Voice Chat] Error leaving voice chat:", error);
      throw error;
    }
  }, [disconnect, cleanupLocalAudio, clearParticipants, client, localAudioTrack]);

  useEffect(() => {
    console.log("[Voice Chat] Setting up voice chat event listeners");

    const handleUserJoined = (user: any) => {
      const uidNumber = Number(user.uid);
      if (localUid !== null && uidNumber === localUid) {
        console.log("[Voice Chat] Local user reported as joined, ignoring remote add:", uidNumber);
        return;
      }
      console.log("[Voice Chat] Remote user joined:", uidNumber);
      addRemoteParticipant(uidNumber);
    };

    const handleUserLeft = (user: any) => {
      const uidNumber = Number(user.uid);
      if (localUid !== null && uidNumber === localUid) {
        console.log("[Voice Chat] Local user left event received, ignoring removal:", uidNumber);
        return;
      }
      console.log("[Voice Chat] Remote user left:", uidNumber);
      removeParticipant(uidNumber);
    };

    // Listen for remote users joining and leaving
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // IMPORTANT: Listen for user-published to subscribe and play remote audio
    const handleUserPublished = async (user: any, mediaType: string) => {
      console.log("[Voice Chat] User published. UID:", user.uid, "MediaType:", mediaType);
      if (mediaType === "audio") {
        await client.subscribe(user, "audio");
        console.log("[Voice Chat] Subscribed to remote audio. Playing audio for UID:", user.uid);
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: any, mediaType: string) => {
      console.log("[Voice Chat] User unpublished. UID:", user.uid, "MediaType:", mediaType);
      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    // Enable volume indicator
    client.enableAudioVolumeIndicator();

    return () => {
      console.log("[Voice Chat] Cleaning up voice chat event listeners");
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
    };
  }, [client, addRemoteParticipant, removeParticipant, localUid]);

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
