import { useState, useCallback, useEffect } from 'react';
import { IAgoraRTCRemoteUser, UID, useRTCClient } from 'agora-rtc-react';

export const useRemoteUsers = () => {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const client = useRTCClient();

  const handleUserJoined = useCallback(async (user: IAgoraRTCRemoteUser) => {
    console.log("Remote user joined:", user.uid);
    
    // Subscribe to the user's audio track if available
    if (user.hasAudio) {
      try {
        await client.subscribe(user, "audio");
        console.log("Subscribed to audio track of user:", user.uid);
        
        // Play the audio track
        user.audioTrack?.play();
      } catch (error) {
        console.error("Error subscribing to audio:", error);
      }
    }
    
    setRemoteUsers(prev => [...prev, user]);
  }, [client]);

  const handleUserLeft = useCallback((user: UID) => {
    console.log("Remote user left:", user);
    setRemoteUsers(prev => {
      const updatedUsers = prev.filter(u => u.uid !== user);
      // Stop and close the audio track of the leaving user
      const leavingUser = prev.find(u => u.uid === user);
      if (leavingUser?.audioTrack) {
        leavingUser.audioTrack.stop();
      }
      return updatedUsers;
    });
  }, []);

  // Cleanup function for remote users' audio tracks
  const cleanup = useCallback(() => {
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.stop();
      }
    });
    setRemoteUsers([]);
  }, [remoteUsers]);

  return {
    remoteUsers,
    handleUserJoined,
    handleUserLeft,
    cleanup
  };
};