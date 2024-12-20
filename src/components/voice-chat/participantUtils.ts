import type { ParticipantProfile, Participant } from "./types";

export const createParticipant = (uid: number, profile: ParticipantProfile | null = null): Participant => ({
  id: uid,
  username: profile?.display_name || "Anonymous",
  avatar: profile?.avatar_url || "/placeholder.svg",
  isMuted: false,
  isTalking: false,
  tokenHolding: {
    amount: "1000",
    percentage: 25
  }
});

export const updateParticipantTalkingState = (
  participants: Participant[], 
  uid: number, 
  isTalking: boolean
): Participant[] => {
  return participants.map(p => 
    p.id === uid ? { ...p, isTalking } : p
  );
};

export const updateParticipantMuteState = (
  participants: Participant[],
  uid: number,
  isMuted: boolean
): Participant[] => {
  return participants.map(p =>
    p.id === uid ? { ...p, isMuted } : p
  );
};