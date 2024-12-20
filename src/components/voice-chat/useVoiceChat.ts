import { useState, useCallback, useEffect } from 'react';
import { useRTCClient, ILocalTrack } from 'agora-rtc-react';
import type { UID } from 'agora-rtc-sdk-ng';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useRemoteUsers } from './hooks/useRemoteUsers';
import { createParticipant, updateParticipantTalkingState } from './participantUtils';
import type { Participant } from './types';

export const useVoiceChat = ({ channelName, userProfile, agoraAppId }: {
  channelName: string;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  agoraAppId: string;
}) => {
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
  } = useLocalAudio();
  
  const {
    remoteUsers,
    handleUserJoined,
    handleUserLeft,
    cleanup: cleanupRemoteUsers
  } = useRemoteUsers();

  // Handle remote users joining and update participants list
  useEffect(() => {
    if (remoteUsers.length > 0) {
      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newParticipants = remoteUsers
          .filter(user => !existingIds.has(Number(user.uid)))
          .map(user => {
            const participant = createParticipant(Number(user.uid));
            console.log("Created new participant:", participant);
            return participant;
          });
        
        if (newParticipants.length === 0) return prev;
        const updatedParticipants = [...prev, ...newParticipants];
        console.log("Updated participants list:", updatedParticipants);
        return updatedParticipants;
      });
    }
  }, [remoteUsers]);

  const join = useCallback(async () => {
    if (isConnected) {
      console.log("Already connected to voice chat");
      return;
    }

    try {
      console.log("Joining channel:", channelName);
      const uid = await client.join(agoraAppId, channelName, null, undefined);
      console.log("Joined voice chat with UID:", uid);

      const audioTrack = await createLocalAudioTrack();
      console.log("Created local audio track");

      const trackToPublish = getTrackForPublishing();
      if (trackToPublish.length > 0) {
        await client.publish((trackToPublish[0] as unknown) as ILocalTrack);
        console.log("Published local audio track");
      }

      // Add local participant
      const localParticipant = createParticipant(Number(uid), userProfile);
      setParticipants([localParticipant]);
      console.log("Added local participant:", localParticipant);
      
      setIsConnected(true);
    } catch (error) {
      console.error("Error joining voice chat:", error);
      cleanup();
      throw error;
    }
  }, [client, channelName, isConnected, createLocalAudioTrack, getTrackForPublishing, agoraAppId, userProfile]);

  const leave = useCallback(async () => {
    if (!isConnected) {
      console.log("Not connected to voice chat");
      return;
    }

    try {
      cleanup();
      console.log("Left voice chat");
    } catch (error) {
      console.error("Error leaving voice chat:", error);
      throw error;
    }
  }, [isConnected]);

  const cleanup = useCallback(() => {
    cleanupLocalAudio();
    cleanupRemoteUsers();
    client.leave();
    setIsConnected(false);
    setParticipants([]);
    console.log("Cleaned up voice chat resources");
  }, [client, cleanupLocalAudio, cleanupRemoteUsers]);

  const handleToggleMute = useCallback((userId: number) => {
    setParticipants(prev => 
      prev.map(p => p.id === userId ? { ...p, isMuted: !p.isMuted } : p)
    );
  }, []);

  // Set up event listeners for user join/leave
  useEffect(() => {
    console.log("Setting up voice chat event listeners");
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      console.log("Cleaning up voice chat event listeners");
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