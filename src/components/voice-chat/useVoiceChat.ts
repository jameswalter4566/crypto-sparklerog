import { useState, useEffect } from "react";
import { useRTCClient } from "agora-rtc-react";
import type { IAgoraRTCRemoteUser, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseVoiceChatProps {
  channelName: string;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  agoraAppId: string;
}

interface Participant {
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

export const useVoiceChat = ({ channelName, userProfile, agoraAppId }: UseVoiceChatProps) => {
  const client = useRTCClient();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  // Function to create participant object from user data
  const createParticipant = (uid: number, profile: any = null): Participant => ({
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

  useEffect(() => {
    let mounted = true;

    const initVoiceChat = async () => {
      try {
        // Join the Agora channel
        await client.join(agoraAppId, channelName, null, null);
        console.log("Successfully joined channel:", channelName);

        // Create and publish local audio track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (!mounted) {
          audioTrack.close();
          return;
        }

        await client.publish([audioTrack]);
        setLocalAudioTrack(audioTrack);

        // Add local user to participants
        if (userProfile) {
          setParticipants(prev => [
            ...prev,
            createParticipant(client.uid as number, userProfile)
          ]);
        }

        // Set up volume indicator for local audio
        audioTrack.enableVolumeIndicator();
        audioTrack.on("volume-indicator", (volume) => {
          setParticipants(prev => 
            prev.map(p => 
              p.id === client.uid 
                ? { ...p, isTalking: volume > 5 }
                : p
            )
          );
        });

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

    // Handle remote users joining
    const handleUserJoined = async (user: IAgoraRTCRemoteUser) => {
      try {
        // Subscribe to the remote user's audio track
        await client.subscribe(user, "audio");
        console.log("Subscribed to remote user:", user.uid);

        // Get user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', user.uid.toString())
          .single();

        // Add remote user to participants
        setParticipants(prev => [...prev, createParticipant(user.uid, profile)]);

        // Set up volume indicator for remote user
        if (user.audioTrack) {
          user.audioTrack.enableVolumeIndicator();
          user.audioTrack.on("volume-indicator", (volume) => {
            setParticipants(prev => 
              prev.map(p => 
                p.id === user.uid 
                  ? { ...p, isTalking: volume > 5 }
                  : p
              )
            );
          });
        }
      } catch (error) {
        console.error("Error subscribing to remote user:", error);
      }
    };

    // Handle remote users leaving
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      console.log("Remote user left:", user.uid);
      setParticipants(prev => prev.filter(p => p.id !== user.uid));
    };

    // Handle remote user mute/unmute
    const handleUserMuted = (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "audio") {
        setParticipants(prev =>
          prev.map(p =>
            p.id === user.uid ? { ...p, isMuted: true } : p
          )
        );
      }
    };

    const handleUserUnmuted = (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "audio") {
        setParticipants(prev =>
          prev.map(p =>
            p.id === user.uid ? { ...p, isMuted: false } : p
          )
        );
      }
    };

    // Set up event listeners
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    client.on("user-muted", handleUserMuted);
    client.on("user-unmuted", handleUserUnmuted);

    return () => {
      mounted = false;
      // Clean up
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