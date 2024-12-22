import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { VoiceChatControls } from "./VoiceChatControls";
import { VoiceChatParticipants } from "./VoiceChatParticipants";
import { useVoiceChat } from "./useVoiceChat";
import { DeviceSelector } from "./DeviceSelector";
import { useAudioDevices } from "./hooks/useAudioDevices";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave: () => void;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

const AGORA_APP_ID = "c6f7a2828b774baebabd8ece87268954";
const VOICE_CHAT_STATE_KEY = 'voiceChatState';

export const VoiceChatRoom = ({ channelName, onLeave, userProfile }: VoiceChatRoomProps) => {
  const [isDeviceSelected, setIsDeviceSelected] = useState(() => {
    const savedState = localStorage.getItem(VOICE_CHAT_STATE_KEY);
    return savedState ? JSON.parse(savedState).isDeviceSelected : false;
  });

  const {
    isLoading,
    error,
    audioDevices,
    selectedMicrophoneId,
    setSelectedMicrophoneId
  } = useAudioDevices();

  const { toast } = useToast();

  const {
    participants,
    isMuted,
    handleToggleMute,
    join,
    leave,
    toggleMute,
    isConnected
  } = useVoiceChat({
    channelName,
    userProfile,
    agoraAppId: AGORA_APP_ID,
    microphoneId: selectedMicrophoneId,
  });

  useEffect(() => {
    // Save connection state
    localStorage.setItem(VOICE_CHAT_STATE_KEY, JSON.stringify({
      isDeviceSelected,
      channelName,
      microphoneId: selectedMicrophoneId
    }));
  }, [isDeviceSelected, channelName, selectedMicrophoneId]);

  const handleDeviceSelect = async () => {
    try {
      console.log("[VoiceChatRoom] Joining with device:", selectedMicrophoneId);
      await join();
      setIsDeviceSelected(true);
      localStorage.setItem('selectedMicrophoneId', selectedMicrophoneId);
    } catch (err) {
      console.error('[VoiceChatRoom] Join error:', err);
      const errorMsg = err instanceof Error ? err.message : "Failed to join voice chat";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    }
  };

  const handleLeave = () => {
    leave();
    localStorage.removeItem(VOICE_CHAT_STATE_KEY);
    onLeave();
  };

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isDeviceSelected && !isConnected) {
        console.log("[VoiceChatRoom] Page visible, reconnecting...");
        try {
          await join();
        } catch (err) {
          console.error('[VoiceChatRoom] Reconnection error:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDeviceSelected, isConnected, join]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Initializing voice chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onLeave}>Close</Button>
      </div>
    );
  }

  if (!isDeviceSelected) {
    return (
      <DeviceSelector
        audioDevices={audioDevices}
        selectedMicrophoneId={selectedMicrophoneId}
        onDeviceSelect={setSelectedMicrophoneId}
        onJoin={handleDeviceSelect}
        onCancel={onLeave}
      />
    );
  }

  return (
    <div className="p-4">
      <VoiceChatControls
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onLeave={handleLeave}
      />
      <VoiceChatParticipants
        participants={participants}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
};