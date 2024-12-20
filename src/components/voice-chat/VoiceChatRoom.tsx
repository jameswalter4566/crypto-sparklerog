import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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

export const VoiceChatRoom = ({ channelName, onLeave, userProfile }: VoiceChatRoomProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>("");
  const [isDeviceSelected, setIsDeviceSelected] = useState(false);
  const { toast } = useToast();

  const {
    participants,
    isMuted,
    handleToggleMute,
    join,
    leave,
    toggleMute
  } = useVoiceChat({
    channelName,
    userProfile,
    agoraAppId: AGORA_APP_ID,
    microphoneId: selectedMicrophoneId,
  });

  // Debug: Log whenever participants change
  useEffect(() => {
    console.log("Participants updated:", participants);
  }, [participants]);

  useEffect(() => {
    const getDevices = async () => {
      console.log("Requesting audio permission and listing devices...");
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await AgoraRTC.getMicrophones();
        console.log("Available audio devices:", devices);
        setAudioDevices(devices);
        if (devices.length > 0) {
          setSelectedMicrophoneId(devices[0].deviceId);
        } else {
          setError("No audio input devices found. Please plug in a microphone.");
        }
      } catch (err) {
        console.error('Failed to get audio devices:', err);
        const errorMsg = err instanceof Error ? err.message : "Failed to access microphone. Please check your browser permissions.";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();
  }, [toast]);

  const handleDeviceSelect = async () => {
    console.log("Selected microphone ID:", selectedMicrophoneId);
    if (!selectedMicrophoneId) {
      const errMsg = "Please select a microphone device before joining.";
      setError(errMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errMsg,
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Attempting to join voice chat...");
      await join(); // Ensure that join() handles track creation and publishing
      setIsDeviceSelected(true);
      console.log("Successfully joined voice chat with device:", selectedMicrophoneId);
    } catch (err) {
      console.error('Failed to initialize Agora:', err);
      const errorMsg = err instanceof Error ? err.message : "An error occurred while setting up voice chat.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      console.log("Cleaning up voice chat...");
      if (isDeviceSelected) {
        leave();
      }
    };
  }, [leave, isDeviceSelected]);

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
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Audio Device</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Microphone</label>
            <Select
              value={selectedMicrophoneId}
              onValueChange={setSelectedMicrophoneId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select microphone..." />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onLeave}>
              Cancel
            </Button>
            <Button
              onClick={handleDeviceSelect}
              disabled={!selectedMicrophoneId}
            >
              Join Voice Chat
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <VoiceChatControls
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onLeave={onLeave}
      />
      <VoiceChatParticipants
        participants={participants}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
};
