import { useState, useCallback, useEffect } from 'react';
import { useRTCClient } from 'agora-rtc-react';
import type { UID } from 'agora-rtc-sdk-ng';
import { useLocalAudio } from './hooks/useLocalAudio';
import { useRemoteUsers } from './hooks/useRemoteUsers';
import { createParticipant } from './participantUtils';
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

  const join = useCallback(async () => {
    if (isConnected) {
      console.log("Already connected to voice chat");
      return;
    }

    try {
      // Join the channel
      const uid = await client.join(agoraAppId, channelName, null, null);
      console.log("Joined voice chat with UID:", uid);

      // Create and publish local audio track
      const audioTrack = await createLocalAudioTrack();
      await client.publish(getTrackForPublishing());
      console.log("Published local audio track");

      // Add local participant
      setParticipants([createParticipant(uid, userProfile)]);
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