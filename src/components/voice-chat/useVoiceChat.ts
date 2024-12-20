import { useState, useCallback, useEffect } from 'react';
import { useRTCClient, ILocalTrack } from 'agora-rtc-react';
import type { IAgoraRTCRemoteUser, UID } from 'agora-rtc-sdk-ng';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useRemoteUsers } from './hooks/useRemoteUsers';
import { createParticipant, updateParticipantTalkingState } from './participantUtils';
import type { Participant } from './types';

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
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const {
    localAudioTrack,
    isMuted,
    createLocalAudioTrack,
    toggleMute,
    cleanup: cleanupLocalAudio,
    getTrackForPublishing
  } = useLocalAudio(microphoneId);
  
  const {
    remoteUsers,
    handleUserJoined,
    handleUserLeft,
    cleanup: cleanupRemoteUsers
  } = useRemoteUsers();

  const join = useCallback(async () => {
    if (isConnected) {
      console.log("[Voice Chat] Already connected to voice chat");
      return;
    }

    try {
      console.log("[Voice Chat] Joining channel:", channelName);
      const uid = await client.join(agoraAppId, channelName, null, undefined);
      console.log("[Voice Chat] Joined channel with UID:", uid);

      console.log("[Voice Chat] Creating local audio track with device:", microphoneId);
      const audioTrack = await createLocalAudioTrack();
      console.log("[Voice Chat] Created local audio track:", audioTrack);

      const trackToPublish = getTrackForPublishing();
      console.log("[Voice Chat] Tracks to publish:", trackToPublish);

      if (trackToPublish.length > 0) {
        console.log("[Voice Chat] Publishing audio track");
        await client.publish((trackToPublish[0] as unknown) as ILocalTrack);
        console.log("[Voice Chat] Published audio track successfully");
      } else {
        console.warn("[Voice Chat] No audio track to publish");
      }

      const localParticipant = createParticipant(Number(uid), userProfile);
      setParticipants([localParticipant]);
      console.log("[Voice Chat] Added local participant:", localParticipant);
      
      setIsConnected(true);
      console.log("[Voice Chat] Successfully connected to voice chat");
    } catch (error) {
      console.error("[Voice Chat] Error joining voice chat:", error);
      cleanup();
      throw error;
    }
  }, [client, channelName, isConnected, createLocalAudioTrack, getTrackForPublishing, agoraAppId, userProfile, microphoneId]);

  const leave = useCallback(async () => {
    if (!isConnected) {
      console.log("[Voice Chat] Not connected to voice chat");
      return;
    }

    try {
      cleanup();
      console.log("[Voice Chat] Left voice chat");
    } catch (error) {
      console.error("[Voice Chat] Error leaving voice chat:", error);
      throw error;
    }
  }, [isConnected]);

  const cleanup = useCallback(() => {
    cleanupLocalAudio();
    cleanupRemoteUsers();
    client.leave();
    setIsConnected(false);
    setParticipants([]);
    console.log("[Voice Chat] Cleaned up voice chat resources");
  }, [client, cleanupLocalAudio, cleanupRemoteUsers]);

  const handleToggleMute = useCallback((userId: number) => {
    setParticipants(prev => 
      prev.map(p => p.id === userId ? { ...p, isMuted: !p.isMuted } : p)
    );
  }, []);

  // Set up event listeners for user join/leave
  useEffect(() => {
    console.log("[Voice Chat] Setting up voice chat event listeners");
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      console.log("[Voice Chat] Cleaning up voice chat event listeners");
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [client, handleUserJoined, handleUserLeft]);

  // Handle volume indicator to show who is talking
  useEffect(() => {
    const handleVolumeIndicator = (volumes: { [uid: string]: number }) => {
      setParticipants(prev => {
        let updated = false;
        const newParticipants = prev.map(p => {
          const volume = volumes[p.id];
          const isTalking = volume && volume > 5;
          if (p.isTalking !== isTalking) {
            updated = true;
            return { ...p, isTalking };
          }
          return p;
        });
        return updated ? newParticipants : prev;
      });
    };

    client.enableAudioVolumeIndicator();
    client.on("volume-indicator", handleVolumeIndicator);

    return () => {
      client.off("volume-indicator", handleVolumeIndicator);
    };
  }, [client]);

  return {
    isConnected,
    localAudioTrack,
    remoteUsers,
    isMuted,
    participants,
    handleToggleMute,
    join,
    leave,
    toggleMute
  };
};