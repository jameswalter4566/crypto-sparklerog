import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { getAgoraAppId, DEFAULT_TOKEN } from "./AgoraConfig";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave?: () => void;
}

export const VoiceChatRoom = ({ channelName, onLeave }: VoiceChatRoomProps) => {
  const [calling, setCalling] = useState(false);
  const [agoraAppId, setAgoraAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConnected = useIsConnected();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAgora = async () => {
      const appId = await getAgoraAppId();
      setAgoraAppId(appId);
      setIsLoading(false);
      if (appId) {
        setCalling(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize voice chat. Please try again later.",
        });
      }
    };

    initializeAgora();
  }, [toast]);

  // Join the channel
  useJoin(
    {
      appid: agoraAppId || "",
      channel: channelName,
      token: DEFAULT_TOKEN,
    },
    calling && !!agoraAppId
  );

  // Local user audio
  const [micOn, setMic] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  usePublish([localMicrophoneTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();

  const handleLeave = () => {
    setCalling(false);
    toast({
      description: "Left voice chat room",
    });
    onLeave?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!agoraAppId) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">
          Voice chat is currently unavailable. Please try again later.
        </p>
        <Button onClick={onLeave}>Close</Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">Connecting to voice chat...</p>
        <Button onClick={onLeave}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <LocalUser audioTrack={localMicrophoneTrack} micOn={micOn}>
            <span className="text-sm font-medium">You</span>
          </LocalUser>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMic((prev) => !prev)}
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        </div>
        <Button variant="destructive" size="icon" onClick={handleLeave}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {remoteUsers.map((user) => (
          <div key={user.uid} className="bg-card p-4 rounded-lg">
            <RemoteUser user={user}>
              <span className="text-sm font-medium">User {user.uid}</span>
            </RemoteUser>
          </div>
        ))}
      </div>
    </div>
  );
};