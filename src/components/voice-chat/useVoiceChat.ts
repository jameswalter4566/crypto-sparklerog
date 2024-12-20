import { useState, useEffect } from "react";
import { useRTCClient } from "agora-rtc-react";
import type { 
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  UID,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack
} from "agora-rtc-sdk-ng";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  type Participant,
  type UseVoiceChatProps
} from "./types";
import { 
  createParticipant,
  updateParticipantTalkingState,
  updateParticipantMuteState
} from "./participantUtils";

export const useVoiceChat = ({ channelName, userProfile, agoraAppId }: UseVoiceChatProps) => {
  const client = useRTCClient();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initVoiceChat = async () => {
      try {
        // Join the Agora channel
        const uid = await client.join(agoraAppId, channelName, null, null);
        console.log("Successfully joined channel:", channelName);

        // Create and publish local audio track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (!mounted) {
          audioTrack.close();
          return;
        }

        // Publish the audio track to the channel
        await client.publish(audioTrack as any);
        console.log("Published local audio track");
        setLocalAudioTrack(audioTrack);

        // Add local user to participants
        if (userProfile) {
          setParticipants(prev => [
            ...prev,
            createParticipant(uid as number, userProfile)
          ]);
        }

        // Monitor audio levels
        client.enableAudioVolumeIndicator();
        client.on("volume-indicator", (volumes) => {
          if (mounted) {
            volumes.forEach(volume => {
              setParticipants(prev => 
                updateParticipantTalkingState(prev, volume.uid as number, volume.level > 5)
              );
            });
          }
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

    // Handle remote users joining
    const handleUserJoined = async (user: IAgoraRTCRemoteUser) => {
      try {
        console.log("Remote user joined:", user.uid);
        
        // Subscribe to the remote user's audio track
        if (user.hasAudio) {
          await client.subscribe(user, "audio");
          console.log("Subscribed to remote user audio:", user.uid);
          
          // Play the remote user's audio track
          user.audioTrack?.play();
          console.log("Playing remote user audio:", user.uid);
        }

        // Get user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', user.uid.toString())
          .single();

        // Add remote user to participants
        setParticipants(prev => [...prev, createParticipant(Number(user.uid), profile)]);

      } catch (error) {
        console.error("Error handling remote user:", error);
      }
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      console.log("Remote user left:", user.uid);
      // Stop the remote user's audio track if it exists
      if (user.audioTrack) {
        user.audioTrack.stop();
      }
      setParticipants(prev => prev.filter(p => p.id !== Number(user.uid)));
    };

    // Handle remote user mute/unmute
    const handleUserMuted = (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "audio") {
        setParticipants(prev =>
          updateParticipantMuteState(prev, Number(user.uid), true)
        );
      }
    };

    const handleUserUnmuted = (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "audio") {
        setParticipants(prev =>
          updateParticipantMuteState(prev, Number(user.uid), false)
        );
      }
    };

    // Set up event listeners
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    client.on("user-muted", handleUserMuted);
    client.on("user-unmuted", handleUserUnmuted);

    initVoiceChat();

    return () => {
      mounted = false;
      // Clean up
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      // Leave the channel and remove all event listeners
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
        updateParticipantMuteState(prev, client.uid as number, newMutedState)
      );
    }
  };

  return {
    participants,
    isMuted,
    handleToggleMute
  };
};