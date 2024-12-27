import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VoiceChatControls } from "./VoiceChatControls";
import { VoiceChatParticipants } from "./VoiceChatParticipants";
import { useVoiceChat } from "./useVoiceChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import AgoraRTC from "agora-rtc-sdk-ng";
import { toast } from "sonner";
import { DeviceSelect } from "./DeviceSelect";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave: () => void;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const VoiceChatRoom = ({ channelName, onLeave, userProfile }: VoiceChatRoomProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>(() => {
    return localStorage.getItem('selectedMicrophoneId') || "";
  });
  const [selectedCameraId, setSelectedCameraId] = useState<string>(() => {
    return localStorage.getItem('selectedCameraId') || "";
  });
  const [isDeviceSelected, setIsDeviceSelected] = useState(false);

  const {
    participants,
    isMuted,
    isVideoEnabled,
    handleToggleMute,
    handleToggleVideo,
    join,
    leave,
    toggleMute,
    isConnected
  } = useVoiceChat({
    channelName,
    userProfile,
    agoraAppId: "c6f7a2828b774baebabd8ece87268954",
    microphoneId: selectedMicrophoneId,
    cameraId: selectedCameraId
  });

  useEffect(() => {
    const getDevices = async () => {
      console.log("[VoiceChatRoom] Requesting media permissions and listing devices...");
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const audioDevs = await AgoraRTC.getMicrophones();
        const videoDevs = await AgoraRTC.getCameras();
        
        console.log("[VoiceChatRoom] Available audio devices:", audioDevs);
        console.log("[VoiceChatRoom] Available video devices:", videoDevs);
        
        setAudioDevices(audioDevs);
        setVideoDevices(videoDevs);
        
        // Handle audio device selection
        const savedAudioId = localStorage.getItem('selectedMicrophoneId');
        if (savedAudioId && audioDevs.some(device => device.deviceId === savedAudioId)) {
          setSelectedMicrophoneId(savedAudioId);
        } else if (audioDevs.length > 0) {
          setSelectedMicrophoneId(audioDevs[0].deviceId);
        }

        // Handle video device selection
        const savedVideoId = localStorage.getItem('selectedCameraId');
        if (savedVideoId && videoDevs.some(device => device.deviceId === savedVideoId)) {
          setSelectedCameraId(savedVideoId);
        } else if (videoDevs.length > 0) {
          setSelectedCameraId(videoDevs[0].deviceId);
        }

        if (audioDevs.length === 0) {
          const errMsg = "No audio input devices found. Please plug in a microphone.";
          setError(errMsg);
          toast.error(errMsg);
        }
      } catch (err) {
        console.error('[VoiceChatRoom] Failed to get media devices:', err);
        const errorMsg = err instanceof Error ? err.message : "Failed to access media devices. Please check your browser permissions.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();

    const handleDeviceChange = async () => {
      console.log("[VoiceChatRoom] Media devices changed");
      const audioDevs = await AgoraRTC.getMicrophones();
      const videoDevs = await AgoraRTC.getCameras();
      setAudioDevices(audioDevs);
      setVideoDevices(videoDevs);
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  const handleDeviceSelect = async () => {
    console.log("[VoiceChatRoom] Selected devices - Mic:", selectedMicrophoneId, "Camera:", selectedCameraId);
    if (!selectedMicrophoneId) {
      const errMsg = "Please select a microphone device before joining.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("[VoiceChatRoom] Attempting to join voice chat...");
      await join();
      setIsDeviceSelected(true);
      localStorage.setItem('selectedMicrophoneId', selectedMicrophoneId);
      localStorage.setItem('selectedCameraId', selectedCameraId);
      console.log("[VoiceChatRoom] Successfully joined voice chat");
    } catch (err) {
      console.error('[VoiceChatRoom] Failed to initialize voice chat:', err);
      const errorMsg = err instanceof Error ? err.message : "An error occurred while setting up voice chat.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDeviceSelected) {
        leave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isDeviceSelected) {
        leave();
      }
    };
  }, [leave, isDeviceSelected]);

  // Find the local participant to pass their ID to the controls
  const localParticipant = participants.find(p => p.isLocal);
  const localUserId = localParticipant?.id;

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
    return <DeviceSelect 
      audioDevices={audioDevices}
      videoDevices={videoDevices}
      selectedMicrophoneId={selectedMicrophoneId}
      selectedCameraId={selectedCameraId}
      setSelectedMicrophoneId={setSelectedMicrophoneId}
      setSelectedCameraId={setSelectedCameraId}
      onConfirm={handleDeviceSelect}
      onCancel={onLeave}
    />;
  }

  return (
    <div className="p-4">
      <VoiceChatControls
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        onToggleMute={() => localUserId && handleToggleMute(localUserId)}
        onToggleVideo={() => localUserId && handleToggleVideo(localUserId)}
        onLeave={onLeave}
      />
      <VoiceChatParticipants
        participants={participants}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
      />
    </div>
  );
};