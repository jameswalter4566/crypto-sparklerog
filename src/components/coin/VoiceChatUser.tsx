import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { VideoStream } from "../voice-chat/VideoStream";
import type { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface VoiceChatUserProps {
  user: {
    id: number;
    username: string;
    avatar: string;
    isMuted: boolean;
    isTalking: boolean;
    solBalance: number | null;
    videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | null;
    isVideoEnabled?: boolean;
  };
  onToggleMute: (userId: number) => void;
  onToggleVideo?: (userId: number) => void;
  isLocal?: boolean;
}

export const VoiceChatUser = ({ 
  user, 
  onToggleMute, 
  onToggleVideo,
  isLocal = false 
}: VoiceChatUserProps) => {
  const displayName = user.username?.trim() || "User";

  return (
    <div
      className={`
        flex flex-col items-center p-4 bg-black/20 rounded-lg 
        hover:bg-black/30 transition-colors border border-primary relative
        ${user.isTalking ? 'animate-pulse shadow-[0_0_15px_rgba(153,69,255,0.8)]' : 'shadow-[0_0_15px_rgba(153,69,255,0.5)]'}
      `}
    >
      <div className="w-24 h-24 mb-3 relative">
        {user.videoTrack && user.isVideoEnabled ? (
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <VideoStream 
              videoTrack={user.videoTrack} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-center">{displayName}</span>
      </div>
      {user.solBalance !== null && (
        <div className="text-xs text-center text-purple-500 font-medium">
          {user.solBalance.toFixed(2)} SOL
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => onToggleMute(user.id)}
        >
          {user.isMuted ? (
            <MicOff className="h-4 w-4 text-red-500" />
          ) : (
            <Mic className="h-4 w-4 text-green-500" />
          )}
        </Button>
        {isLocal && onToggleVideo && (
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => onToggleVideo(user.id)}
          >
            {!user.isVideoEnabled ? (
              <VideoOff className="h-4 w-4 text-red-500" />
            ) : (
              <Video className="h-4 w-4 text-green-500" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};