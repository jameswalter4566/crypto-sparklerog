import { useState, useCallback } from 'react';
import type { Participant } from '../types';
import { createParticipant } from '../participantUtils';

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const addLocalParticipant = useCallback((uid: number, userProfile: any) => {
    console.log("[Participants] Adding local participant:", { uid, userProfile });
    setParticipants(prev => {
      // Check if participant already exists
      const exists = prev.find(p => p.id === uid);
      if (exists) {
        console.log("[Participants] Local participant already exists:", exists);
        return prev;
      }
      const localParticipant = createParticipant(uid, userProfile);
      console.log("[Participants] Created local participant:", localParticipant);
      return [localParticipant];
    });
  }, []);

  const addRemoteParticipant = useCallback((uid: number) => {
    console.log("[Participants] Adding remote participant:", uid);
    setParticipants(prev => {
      // Check if participant already exists
      const exists = prev.find(p => p.id === uid);
      if (exists) {
        console.log("[Participants] Remote participant already exists:", exists);
        return prev;
      }
      // Add new remote participant while preserving existing ones
      const newParticipant = createParticipant(uid, null);
      console.log("[Participants] Created remote participant:", newParticipant);
      return [...prev, newParticipant];
    });
  }, []);

  const removeParticipant = useCallback((uid: number) => {
    console.log("[Participants] Removing participant:", uid);
    setParticipants(prev => {
      const filtered = prev.filter(p => p.id !== uid);
      console.log("[Participants] Remaining participants:", filtered);
      return filtered;
    });
  }, []);

  const handleToggleMute = useCallback((userId: number) => {
    console.log("[Participants] Toggling mute for user:", userId);
    setParticipants(prev =>
      prev.map(p => p.id === userId ? { ...p, isMuted: !p.isMuted } : p)
    );
  }, []);

  const clearParticipants = useCallback(() => {
    console.log("[Participants] Clearing all participants");
    setParticipants([]);
  }, []);

  return {
    participants,
    addLocalParticipant,
    addRemoteParticipant,
    removeParticipant,
    handleToggleMute,
    clearParticipants
  };
};