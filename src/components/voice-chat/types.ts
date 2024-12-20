import type { UID } from "agora-rtc-sdk-ng";

export interface Participant {
  id: number;
  username: string;
  avatar: string;
  isMuted: boolean;
  isTalking: boolean;
  tokenHolding: {
    amount: string;
    percentage: number;
  };
}

export interface UseVoiceChatProps {
  channelName: string;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  agoraAppId: string;
}

export interface ParticipantProfile {
  display_name: string | null;
  avatar_url: string | null;
}