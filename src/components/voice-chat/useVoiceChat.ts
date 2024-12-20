import { useCallback, useEffect, useState } from 'react';
import { useRTCClient } from 'agora-rtc-react';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useParticipants } from './hooks/useParticipants';
import { useVoiceChatConnection } from './hooks/useVoiceChatConnection';
import type { ILocalTrack } from 'agora-rtc-react';
import type { ParticipantProfile } from './types'; // Ensure this type is imported
import { fetchUserProfile } from '@/services/fetchUserProfile'; // A function you write to fetch profile data

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

      // Connect and publish the audio track
      const uid = await connect(channelName, agoraAppId, audioTrack as unknown as ILocalTrack);
      const uidNumber = Number(uid);
      setLocalUid(uidNumber);

      // Publish the audio track
      await client.publish([audioTrack as unknown as ILocalTrack]);
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
        await client.unpublish([localAudioTrack as unknown as ILocalTrack]);
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

    const handleUserJoined = async (user: any) => {
      const uidNumber = Number(user.uid);
      if (localUid !== null && uidNumber === localUid) {
        console.log("[Voice Chat] Local user reported as joined (ignoring remote add):", uidNumber);
        return;
      }
      console.log("[Voice Chat] Remote user joined:", uidNumber);

      // **New Code: Fetch the remote user's profile before adding them**
      let fetchedProfile: ParticipantProfile | null = null;
      try {
        fetchedProfile = await fetchUserProfile(uidNumber);
        console.log("[Voice Chat] Fetched remote user profile:", fetchedProfile);
      } catch (err) {
        console.error("[Voice Chat] Error fetching remote user profile:", err);
      }

      addRemoteParticipant(uidNumber, fetchedProfile);
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

    const handleUserPublished = async (user: any, mediaType: string) => {
      console.log("[Voice Chat] User published:", user.uid, "MediaType:", mediaType);
      if (mediaType === "audio") {
        await client.subscribe(user, "audio");
        console.log("[Voice Chat] Subscribed to remote audio:", user.uid);
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: any, mediaType: string) => {
      console.log("[Voice Chat] User unpublished:", user.uid, "MediaType:", mediaType);
      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }
    };

    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
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
