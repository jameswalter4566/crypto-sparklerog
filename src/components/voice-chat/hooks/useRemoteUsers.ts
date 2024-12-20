import { useState, useCallback, useEffect } from 'react';
import { IAgoraRTCRemoteUser, UID, useRTCClient } from 'agora-rtc-react';

export const useRemoteUsers = () => {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const client = useRTCClient();

  const handleUserJoined = useCallback(async (user: IAgoraRTCRemoteUser) => {
    console.log("Remote user joined:", user.uid);
    
    if (user.hasAudio) {
      try {
        await client.subscribe(user, "audio");
        console.log("Subscribed to audio track of user:", user.uid);
        
        if (user.audioTrack) {
          // Create a dedicated audio element for this user
          const audioElement = document.createElement('audio');
          audioElement.id = `audio-${user.uid}`;
          document.body.appendChild(audioElement);
          
          // Play the audio track without arguments as per Agora's API
          user.audioTrack.play();
          console.log("Started playing audio for user:", user.uid);
        }
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
      const leavingUser = prev.find(u => u.uid === user);
      
      if (leavingUser?.audioTrack) {
        leavingUser.audioTrack.stop();
        
        // Remove the audio element from DOM
        const audioElement = document.getElementById(`audio-${user}`);
        if (audioElement) {
          document.body.removeChild(audioElement);
        }
      }
      
      return updatedUsers;
    });
  }, []);

  // Cleanup function for remote users' audio tracks
  const cleanup = useCallback(() => {
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.stop();
        
        // Remove audio elements during cleanup
        const audioElement = document.getElementById(`audio-${user.uid}`);
        if (audioElement) {
          document.body.removeChild(audioElement);
        }
      }
    });
    setRemoteUsers([]);
  }, [remoteUsers]);

  // Ensure audio elements are cleaned up when component unmounts
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