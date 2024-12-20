import { useState, useEffect } from "react";
import { useRTCClient } from "agora-rtc-react";
import type { IAgoraRTCRemoteUser, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useToast } from "@/components/ui/use-toast";

interface UseVoiceChatProps {
  channelName: string;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  agoraAppId: string;
}

export const useVoiceChat = ({ channelName, userProfile, agoraAppId }: UseVoiceChatProps) => {
  const client = useRTCClient();
  const [participants, setParticipants] = useState<Array<{
    id: number;
    username: string;
    avatar: string;
    isMuted: boolean;
    isTalking: boolean;
    tokenHolding: {
      amount: string;
      percentage: number;
    };
  }>>([]);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initVoiceChat = async () => {
      try {
        await client.join(agoraAppId, channelName, null, null);
        
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (!mounted) {
          audioTrack.close();
          return;
        }

        await client.publish([audioTrack]);
        setLocalAudioTrack(audioTrack);

        if (userProfile) {
          setParticipants([{
            id: client.uid as number,
            username: userProfile.display_name || "Anonymous",
            avatar: userProfile.avatar_url || "/placeholder.svg",
            isMuted: false,
            isTalking: false,
            tokenHolding: {
              amount: "1000",
              percentage: 25
            }
          }]);
        }

      } catch (error) {
        console.error("Error joining voice chat:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to join voice chat. Please try again.",
        });
      }
    };

    initVoiceChat();

    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setParticipants(prev => [...prev, {
        id: user.uid as number,
        username: "Remote User",
        avatar: "/placeholder.svg",
        isMuted: false,
        isTalking: false,
        tokenHolding: {
          amount: "1000",
          percentage: 25
        }
      }]);
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setParticipants(prev => prev.filter(p => p.id !== user.uid));
    };

    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      mounted = false;
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      client.leave();
      client.removeAllListeners();
    };
  }, [agoraAppId, channelName, client, toast, userProfile]);

  const handleToggleMute = async () => {
    if (localAudioTrack) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      await localAudioTrack.setEnabled(!newMutedState);
      
      setParticipants(prev =>
        prev.map(participant =>
          participant.id === client.uid ? { ...participant, isMuted: newMutedState } : participant
        )
      );
    }
  };

  return {
    participants,
    isMuted,
    handleToggleMute
  };
};