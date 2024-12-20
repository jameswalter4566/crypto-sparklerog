import type { ParticipantProfile, Participant } from "./types";

/**
 * Creates a new Participant object with default fields.
 * This function is used when a new user joins the voice chat.
 * 
 * @param uid - The unique identifier of the participant (e.g., Agora UID)
 * @param profile - An optional ParticipantProfile with display_name, avatar_url, etc.
 */
export const createParticipant = (
  uid: number,
  profile: ParticipantProfile | null = null
): Participant => ({
  id: uid,
  username: profile?.display_name || "Anonymous",
  avatar: profile?.avatar_url || "/placeholder.svg",
  isMuted: false,
  isTalking: false,
  tokenHolding: {
    amount: "1000",
    percentage: 25,
  },
});

/**
 * Updates the talking state (isTalking) of a specific participant by their UID.
 * Useful for when the RTC layer detects that a user has started or stopped talking.
 * 
 * @param participants - The current array of participants
 * @param uid - The UID of the participant to update
 * @param isTalking - Whether the participant is currently talking (true/false)
 * @returns A new array of participants with the updated talking state
 */
export const updateParticipantTalkingState = (
  participants: Participant[],
  uid: number,
  isTalking: boolean
): Participant[] => {
  return participants.map((p) =>
    p.id === uid ? { ...p, isTalking } : p
  );
};

/**
 * Updates the mute state (isMuted) of a specific participant by their UID.
 * This can be triggered when a user mutes/unmutes themselves or is force-muted by an admin.
 * 
 * @param participants - The current array of participants
 * @param uid - The UID of the participant to update
 * @param isMuted - Whether the participant is muted (true/false)
 * @returns A new array of participants with the updated mute state
 */
export const updateParticipantMuteState = (
  participants: Participant[],
  uid: number,
  isMuted: boolean
): Participant[] => {
  return participants.map((p) =>
    p.id === uid ? { ...p, isMuted } : p
  );
};
