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
    handleUserLeft
  } = useRemoteUsers();

  // Handle remote users joining
  useEffect(() => {
    if (remoteUsers.length > 0) {
      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newParticipants = remoteUsers
          .filter(user => !existingIds.has(Number(user.uid)))
          .map(user => createParticipant(Number(user.uid)));
        
        if (newParticipants.length === 0) return prev;
        return [...prev, ...newParticipants];
      });
    }
  }, [remoteUsers]);

  const join = useCallback(async () => {
    if (isConnected) {
      console.log("Already connected to voice chat");
      return;
    }

    try {
      // Join the channel
      const uid = await client.join(agoraAppId, channelName, null, undefined);
      console.log("Joined voice chat with UID:", uid);

      // Create and publish local audio track
      const audioTrack = await createLocalAudioTrack();
      const trackToPublish = getTrackForPublishing();
      if (trackToPublish.length > 0) {
        // Double cast to avoid type mismatch between SDK versions
        await client.publish((trackToPublish[0] as unknown) as ILocalTrack);
      }
      console.log("Published local audio track");

      // Add local participant
      setParticipants([createParticipant(Number(uid), userProfile)]);
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
    client.leave();
    setIsConnected(false);
    setParticipants([]);
  }, [client, cleanupLocalAudio]);

  const handleToggleMute = useCallback((userId: number) => {
    setParticipants(prev => 
      prev.map(p => p.id === userId ? { ...p, isMuted: !p.isMuted } : p)
    );
  }, []);

  useEffect(() => {
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [client, handleUserJoined, handleUserLeft]);

  // Handle user leaving
  useEffect(() => {
    const handleUserLeftUpdate = (uid: UID) => {
      setParticipants(prev => prev.filter(p => p.id !== Number(uid)));
    };

    client.on("user-left", handleUserLeftUpdate);
    return () => {
      client.off("user-left", handleUserLeftUpdate);
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