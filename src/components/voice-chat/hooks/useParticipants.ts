import { useState, useCallback } from 'react';
import type { Participant, ParticipantProfile } from '../types';
import { createParticipant } from '../participantUtils';

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const addLocalParticipant = useCallback((uid: number, userProfile: any) => {
    console.log("[Participants] Adding or updating local participant:", { uid, userProfile });
    setParticipants((prev) => {
      const existing = prev.find((p) => p.id === uid);
      const localParticipant = createParticipant(uid, userProfile);

      if (existing) {
        console.log("[Participants] Local participant already exists. Updating profile:", existing);
        return prev.map((p) => (p.id === uid ? localParticipant : p));
      } else {
        const filtered = prev.filter((p) => p.id !== uid);
        return [localParticipant, ...filtered];
      }
    });
  }, []);

  const addRemoteParticipant = useCallback((uid: number, profile: ParticipantProfile | null = null) => {
    console.log("[Participants] Adding remote participant:", uid);
    setParticipants((prev) => {
      const exists = prev.find((p) => p.id === uid);
      if (exists) {
        console.log("[Participants] Remote participant already exists:", exists);
        return prev;
      }
      const newParticipant = createParticipant(uid, profile);
      console.log("[Participants] Created remote participant:", newParticipant);
      return [...prev, newParticipant];
    });
  }, []);

  const removeParticipant = useCallback((uid: number) => {
    console.log("[Participants] Removing participant:", uid);
    setParticipants((prev) => {
      const filtered = prev.filter((p) => p.id !== uid);
      console.log("[Participants] Remaining participants:", filtered);
      return filtered;
    });
  }, []);

  const handleToggleMute = useCallback((userId: number) => {
    console.log("[Participants] Toggling mute for user:", userId);
    setParticipants((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, isMuted: !p.isMuted } : p))
    );
  }, []);

  const handleToggleVideo = useCallback((userId: number) => {
    console.log("[Participants] Toggling video for user:", userId);
    setParticipants((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, isVideoEnabled: !p.isVideoEnabled } : p))
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
    handleToggleVideo,
    clearParticipants
  };
};