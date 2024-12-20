import { useState, useCallback } from 'react';
import { IAgoraRTCRemoteUser, UID } from 'agora-rtc-react';

export const useRemoteUsers = () => {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const handleUserJoined = useCallback((user: IAgoraRTCRemoteUser) => {
    console.log("Remote user joined:", user.uid);
    setRemoteUsers(prev => [...prev, user]);
  }, []);

  const handleUserLeft = useCallback((user: UID) => {
    console.log("Remote user left:", user);
    setRemoteUsers(prev => prev.filter(u => u.uid !== user));
  }, []);

  return {
    remoteUsers,
    handleUserJoined,
    handleUserLeft
  };
};