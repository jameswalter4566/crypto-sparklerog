import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface VoiceChatControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
}

export const VoiceChatControls = ({ 
  isMuted, 
  isVideoEnabled,
  onToggleMute, 
  onToggleVideo,
  onLeave 
}: VoiceChatControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold">Voice Chat Room</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleMute}
          className={isMuted ? "text-red-500" : "text-green-500"}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleVideo}
          className={!isVideoEnabled ? "text-red-500" : "text-green-500"}
        >
          {!isVideoEnabled ? (
            <VideoOff className="h-4 w-4" />
          ) : (
            <Video className="h-4 w-4" />
          )}
        </Button>
        <Button variant="destructive" onClick={onLeave}>
          Leave
        </Button>
      </div>
    </div>
  );
};