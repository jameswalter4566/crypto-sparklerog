import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceChatControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onLeave: () => void;
}

export const VoiceChatControls = ({ isMuted, onToggleMute, onLeave }: VoiceChatControlsProps) => {
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
        <Button variant="destructive" onClick={onLeave}>
          Leave
        </Button>
      </div>
    </div>
  );
};