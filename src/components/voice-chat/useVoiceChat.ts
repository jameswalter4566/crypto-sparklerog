import { useCallback, useEffect, useState } from 'react';
import { useRTCClient, ILocalTrack } from 'agora-rtc-react';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useLocalVideo } from './hooks/useLocalVideo';
import { useParticipants } from './hooks/useParticipants';
import { useVoiceChatConnection } from './hooks/useVoiceChatConnection';
import type { ParticipantProfile } from './types';
import { fetchUserProfile, storeVoiceChatUID } from '@/services/fetchUserProfile';
import { toast } from 'sonner';

interface UseVoiceChatProps {
  channelName: string;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  agoraAppId: string;
  microphoneId?: string;
  cameraId?: string;
}

export const useVoiceChat = ({
  channelName,
  userProfile,
  agoraAppId,
  microphoneId,
  cameraId
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
    localVideoTrack,
    isVideoEnabled,
    createLocalVideoTrack,
    stopVideoTrack,
    toggleVideo
  } = useLocalVideo(cameraId);

  const {
    participants,
    addLocalParticipant,
    addRemoteParticipant,
    removeParticipant,
    handleToggleMute,
    handleToggleVideo,
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

      let videoTrack = null;
      if (cameraId) {
        videoTrack = await createLocalVideoTrack();
      }

      const uid = await connect(channelName, agoraAppId);
      const uidNumber = Number(uid);
      setLocalUid(uidNumber);

      if (userProfile?.wallet_address) {
        console.log("[Voice Chat] Storing UID mapping:", { uid: uidNumber, wallet: userProfile.wallet_address });
        await storeVoiceChatUID(uidNumber, userProfile.wallet_address);
      }

      const tracksToPublish = [audioTrack as unknown as ILocalTrack];
      if (videoTrack) {
        tracksToPublish.push(videoTrack as unknown as ILocalTrack);
      }

      console.log("[Voice Chat] Publishing tracks");
      await client.publish(tracksToPublish);
      console.log("[Voice Chat] Published tracks successfully");

      addLocalParticipant(uidNumber, userProfile);
      console.log("[Voice Chat] Successfully connected to voice chat with UID:", uidNumber);
    } catch (error) {
      console.error("[Voice Chat] Error joining voice chat:", error);
      cleanupLocalAudio();
      stopVideoTrack();
      throw error;
    }
  }, [isConnected, connect, channelName, agoraAppId, createLocalAudioTrack, createLocalVideoTrack, cleanupLocalAudio, stopVideoTrack, addLocalParticipant, userProfile, client, cameraId]);

  const handleUserPublished = useCallback(async (user: any, mediaType: "audio" | "video") => {
    console.log("[Voice Chat] User published:", user.uid, "MediaType:", mediaType);
    await client.subscribe(user, mediaType);
    console.log("[Voice Chat] Subscribed to remote media:", user.uid, mediaType);
    
    if (mediaType === "audio") {
      user.audioTrack?.play();
    } else if (mediaType === "video") {
      const participant = participants.find(p => p.id === user.uid);
      if (participant) {
        handleToggleVideo(user.uid);
      }
    }
  }, [client, participants, handleToggleVideo]);

  const leave = useCallback(async () => {
    try {
      if (localAudioTrack) {
        await client.unpublish([localAudioTrack as unknown as ILocalTrack]);
      }
      if (localVideoTrack) {
        await client.unpublish([localVideoTrack as unknown as ILocalTrack]);
        stopVideoTrack();
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
  }, [disconnect, cleanupLocalAudio, clearParticipants, client, localAudioTrack, localVideoTrack, stopVideoTrack]);

  useEffect(() => {
    console.log("[Voice Chat] Setting up voice chat event listeners");

    const handleUserJoined = async (user: any) => {
      const uidNumber = Number(user.uid);
      if (localUid !== null && uidNumber === localUid) {
        console.log("[Voice Chat] Local user reported as joined (ignoring remote add):", uidNumber);
        return;
      }
      console.log("[Voice Chat] Remote user joined:", uidNumber);

      try {
        const fetchedProfile = await fetchUserProfile(uidNumber);
        console.log("[Voice Chat] Fetched remote user profile:", fetchedProfile);
        addRemoteParticipant(uidNumber, fetchedProfile);
      } catch (err) {
        console.error("[Voice Chat] Error fetching remote user profile:", err);
        addRemoteParticipant(uidNumber, null);
      }
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

    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    client.on("user-published", handleUserPublished);

    return () => {
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.off("user-published", handleUserPublished);
    };
  }, [client, localUid, addRemoteParticipant, removeParticipant, handleUserPublished]);

  return {
    participants,
    isMuted,
    isVideoEnabled,
    handleToggleMute,
    handleToggleVideo,
    join,
    leave,
    toggleMute,
    isConnected
  };
};