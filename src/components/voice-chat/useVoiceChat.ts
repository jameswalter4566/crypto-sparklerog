import { useState, useCallback, useEffect } from 'react';
import { useRTCClient, ILocalTrack } from 'agora-rtc-react';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useRemoteUsers } from './hooks/useRemoteUsers';
import { createParticipant } from './participantUtils';
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
    cleanup: cleanupLocalAudio
  } = useLocalAudio(microphoneId);

  // useRemoteUsers should handle subscribing to audio and updating `remoteUsers`
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

      const trackToPublish = audioTrack as unknown as ILocalTrack;
      console.log("[Voice Chat] Publishing audio track");
      await client.publish(trackToPublish);
      console.log("[Voice Chat] Published audio track successfully");

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
  }, [client, channelName, isConnected, createLocalAudioTrack, agoraAppId, userProfile, microphoneId]);

  const cleanup = useCallback(() => {
    cleanupLocalAudio();
    cleanupRemoteUsers();
    client.leave();
    setIsConnected(false);
    setParticipants([]);
    console.log("[Voice Chat] Cleaned up voice chat resources");
  }, [client, cleanupLocalAudio, cleanupRemoteUsers]);

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
  }, [isConnected, cleanup]);

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

  // Update participants whenever remoteUsers change
  useEffect(() => {
    setParticipants(prev => {
      // Build a map of current participants
      const participantMap = new Map(prev.map(p => [p.id, p]));

      // The first participant in the array should be the local participant
      const localParticipant = prev.find(p => p.id === prev[0]?.id) || null;

      // Add or update remote participants
      for (const user of remoteUsers) {
        const uidNumber = Number(user.uid);
        if (!participantMap.has(uidNumber)) {
          participantMap.set(uidNumber, createParticipant(uidNumber, null));
        }
      }

      // Remove participants no longer in remoteUsers (except the local one)
      const remoteUserIds = new Set(remoteUsers.map(u => Number(u.uid)));
      const finalParticipants = [...participantMap.values()].filter(p => {
        if (localParticipant && p.id === localParticipant.id) return true;
        return remoteUserIds.has(p.id);
      });

      // Ensure local participant stays at the beginning of the array
      if (localParticipant) {
        const others = finalParticipants.filter(p => p.id !== localParticipant.id);
        return [localParticipant, ...others];
      }

      return finalParticipants;
    });
  }, [remoteUsers]);

  // Handle volume indicator to show who is talking
  useEffect(() => {
    client.enableAudioVolumeIndicator();

    const handleVolumeIndicator = (volumes: Array<{ uid: string | number; level: number }>) => {
      setParticipants(prev => {
        let updated = false;
        const newParticipants = prev.map(p => {
          const volumeObj = volumes.find(v => Number(v.uid) === p.id);
          const isTalking = volumeObj ? volumeObj.level > 5 : false;
          if (p.isTalking !== isTalking) {
            updated = true;
            return { ...p, isTalking };
          }
          return p;
        });
        return updated ? newParticipants : prev;
      });
    };

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
