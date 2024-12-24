import type { ParticipantProfile, Participant } from "./types";

export const createParticipant = (
  uid: number,
  profile: ParticipantProfile | null = null
): Participant => {
  const participant = {
    id: uid,
    username: profile?.display_name || `User ${uid.toString().slice(-4)}`,
    avatar: profile?.avatar_url || "/placeholder.svg",
    isMuted: false,
    isTalking: false,
    solBalance: profile?.solBalance || null,
  };

  console.log("[Participant Utils] Created participant:", participant);
  return participant;
};

export const updateParticipantTalkingState = (participants: Participant[], uid: number, isTalking: boolean): Participant[] => {
  return participants.map((p) => p.id === uid ? { ...p, isTalking } : p);
};

export const updateParticipantMuteState = (participants: Participant[], uid: number, isMuted: boolean): Participant[] => {
  return participants.map((p) => p.id === uid ? { ...p, isMuted } : p);
};