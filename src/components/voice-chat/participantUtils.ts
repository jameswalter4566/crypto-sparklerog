import type { ParticipantProfile, Participant } from "./types";

export const createParticipant = (
  uid: number,
  profile: ParticipantProfile | null = null
): Participant => {
  const participant = {
    id: uid,
    // Only use the user's chosen display_name, fallback to "User" if none is provided
    username: profile?.display_name || "User",
    avatar: profile?.avatar_url || "/placeholder.svg",
    isMuted: false,
    isTalking: false,
    tokenHolding: {
      amount: "1000",
      percentage: 25,
    },
  };

  console.log("[Participant Utils] Created participant:", participant);
  return participant;
};

// No changes needed for updateParticipantTalkingState or updateParticipantMuteState
export const updateParticipantTalkingState = (participants: Participant[], uid: number, isTalking: boolean): Participant[] => {
  return participants.map((p) => p.id === uid ? { ...p, isTalking } : p);
};

export const updateParticipantMuteState = (participants: Participant[], uid: number, isMuted: boolean): Participant[] => {
  return participants.map((p) => p.id === uid ? { ...p, isMuted } : p);
};
