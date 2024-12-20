import { useState, useCallback } from 'react';
import type { Participant } from '../types';
import { createParticipant } from '../participantUtils';

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const addLocalParticipant = useCallback((uid: number, userProfile: any) => {
    const localParticipant = createParticipant(uid, userProfile);
    setParticipants([localParticipant]);
    console.log("[Participants] Added local participant:", localParticipant);
  }, []);

  const addRemoteParticipant = useCallback((uid: number) => {
    console.log("[Participants] Remote user joined:", uid);
    setParticipants(prev => {
      const exists = prev.find(p => p.id === uid);
      if (exists) return prev;
      return [...prev, createParticipant(uid, null)];
    });
  }, []);

  const removeParticipant = useCallback((uid: number) => {
    console.log("[Participants] Remote user left:", uid);
    setParticipants(prev => prev.filter(p => p.id !== uid));
  }, []);

  const handleToggleMute = useCallback((userId: number) => {
    setParticipants(prev =>
      prev.map(p => p.id === userId ? { ...p, isMuted: !p.isMuted } : p)
    );
  }, []);

  const clearParticipants = useCallback(() => {
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