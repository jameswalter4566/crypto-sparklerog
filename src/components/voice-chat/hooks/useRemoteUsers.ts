import { useState, useCallback, useEffect } from 'react';
import { IAgoraRTCRemoteUser, UID, useRTCClient } from 'agora-rtc-react';

export const useRemoteUsers = () => {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const client = useRTCClient();

  const handleUserJoined = useCallback(async (user: IAgoraRTCRemoteUser) => {
    console.log("[Remote Users] Remote user joined:", user.uid);
    
    if (user.hasAudio) {
      try {
        await client.subscribe(user, "audio");
        console.log("[Remote Users] Subscribed to audio track of user:", user.uid);
        
        if (user.audioTrack) {
          user.audioTrack.play();
          console.log("[Remote Users] Started playing audio for user:", user.uid);
        }
      } catch (error) {
        console.error("[Remote Users] Error subscribing to audio:", error);
      }
    }
    
    setRemoteUsers(prev => [...prev, user]);
  }, [client]);

  const handleUserLeft = useCallback((user: UID) => {
    console.log("[Remote Users] Remote user left:", user);
    setRemoteUsers(prev => {
      const updatedUsers = prev.filter(u => u.uid !== user);
      const leavingUser = prev.find(u => u.uid === user);
      
      if (leavingUser?.audioTrack) {
        leavingUser.audioTrack.stop();
      }
      
      return updatedUsers;
    });
  }, []);

  const cleanup = useCallback(() => {
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.stop();
      }
    });
    setRemoteUsers([]);
  }, [remoteUsers]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    remoteUsers,
    handleUserJoined,
    handleUserLeft,
    cleanup
  };
};