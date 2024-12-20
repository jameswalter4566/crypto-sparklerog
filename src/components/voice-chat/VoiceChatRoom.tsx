import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { AGORA_APP_ID, DEFAULT_TOKEN } from "./AgoraConfig";
import { useToast } from "@/components/ui/use-toast";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave?: () => void;
}

export const VoiceChatRoom = ({ channelName, onLeave }: VoiceChatRoomProps) => {
  const [calling, setCalling] = useState(true);
  const isConnected = useIsConnected();
  const { toast } = useToast();

  // Join the channel
  useJoin(
    {
      appid: AGORA_APP_ID,
      channel: channelName,
      token: DEFAULT_TOKEN,
    },
    calling
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

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <LocalUser
            audioTrack={localMicrophoneTrack}
            micOn={micOn}
          >
            <span className="text-sm font-medium">You</span>
          </LocalUser>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMic(prev => !prev)}
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleLeave}
        >
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