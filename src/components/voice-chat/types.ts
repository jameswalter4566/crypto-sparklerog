import type { UID } from "agora-rtc-sdk-ng";

/**
 * Represents a participant in the voice chat.
 */
export interface Participant {
  /** The unique numeric identifier for this participant (e.g. Agora UID) */
  id: number;
  /** Display name or username for this participant */
  username: string;
  /** URL to the participant's avatar image */
  avatar: string;
  /** Whether this participant is currently muted */
  isMuted: boolean;
  /** Whether this participant is currently talking (active speaker) */
  isTalking: boolean;
  /** Information about the token holdings for this participant */
  tokenHolding: {
    /** The amount of tokens this participant holds */
    amount: string;
    /** The percentage of total tokens represented by the amount this participant holds */
    percentage: number;
  };
}

/**
 * Properties required to set up the voice chat.
 */
export interface UseVoiceChatProps {
  /** The name of the channel/room to join */
  channelName: string;
  /** The user profile of the local user */
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  /** The Agora App ID used for the voice chat connection */
  agoraAppId: string;
}

/**
 * Represents a participant's profile information.
 */
export interface ParticipantProfile {
  /** The display name of the participant, if available */
  display_name: string | null;
  /** The URL to the participant's avatar image, if available */
  avatar_url: string | null;
}
