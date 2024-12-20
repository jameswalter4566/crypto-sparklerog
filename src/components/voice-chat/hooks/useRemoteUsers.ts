import { useState, useCallback, useEffect } from 'react';
import { IAgoraRTCRemoteUser, UID, useRTCClient } from 'agora-rtc-react';

export const useRemoteUsers = () => {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const client = useRTCClient();

  const handleUserJoined = useCallback((user: IAgoraRTCRemoteUser) => {
    console.log("[Remote Users] Remote user joined:", user.uid);
    setRemoteUsers((prev) => {
      // Add user only if not already present
      const exists = prev.find(u => u.uid === user.uid);
      if (exists) return prev;
      return [...prev, user];
    });
  }, []);

  const handleUserLeft = useCallback((user: UID) => {
    console.log("[Remote Users] Remote user left:", user);
    setRemoteUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.uid !== user);
      const leavingUser = prev.find((u) => u.uid === user);

      if (leavingUser?.audioTrack) {
        leavingUser.audioTrack.stop();
      }

      return updatedUsers;
    });
  }, []);

  const handleUserPublished = useCallback(async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
    console.log(`[Remote Users] User published track. UID: ${user.uid}, MediaType: ${mediaType}`);

    if (mediaType === "audio") {
      try {
        await client.subscribe(user, "audio");
        console.log("[Remote Users] Subscribed to audio of user:", user.uid);
        if (user.audioTrack) {
          user.audioTrack.play();
          console.log("[Remote Users] Started playing audio for user:", user.uid);
        }

        // Update the user in the state (this ensures we have the latest user object with tracks)
        setRemoteUsers((prev) => {
          const index = prev.findIndex(u => u.uid === user.uid);
          if (index > -1) {
            const updated = [...prev];
            updated[index] = user;
            return updated;
          } else {
            return [...prev, user];
          }
        });

      } catch (error) {
        console.error("[Remote Users] Error subscribing to audio:", error);
      }
    }

    // If video tracks are involved, you could handle them similarly here.
  }, [client]);

  const handleUserUnpublished = useCallback((user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
    console.log(`[Remote Users] User unpublished track. UID: ${user.uid}, MediaType: ${mediaType}`);

    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.stop();
      console.log("[Remote Users] Stopped playing audio for user:", user.uid);
    }

    // If you want to remove the user entirely upon unpublishing their track, you can do so here,
    // but usually, we keep the user in the remoteUsers list until they leave the channel.
    setRemoteUsers((prev) => {
      const index = prev.findIndex(u => u.uid === user.uid);
      if (index > -1) {
        const updated = [...prev];
        // Update the user object if needed
        updated[index] = { ...user, audioTrack: null };
        return updated;
      }
      return prev;
    });
  }, []);

  const cleanup = useCallback(() => {
    remoteUsers.forEach((user) => {
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
    handleUserPublished,
    handleUserUnpublished,
    cleanup,
  };
};
