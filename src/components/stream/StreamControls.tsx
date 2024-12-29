import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface StreamControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isStreamer: boolean;
}

export function StreamControls({ isMuted, onToggleMute, isStreamer }: StreamControlsProps) {
  if (!isStreamer) return null;

  return (
    <div className="border-t p-4 flex justify-center">
      <Button
        variant={isMuted ? "secondary" : "default"}
        size="lg"
        onClick={onToggleMute}
        className="w-40"
      >
        {isMuted ? (
          <MicOff className="mr-2 h-5 w-5" />
        ) : (
          <Mic className="mr-2 h-5 w-5" />
        )}
        {isMuted ? "Unmute" : "Mute"}
      </Button>
    </div>
  );
}