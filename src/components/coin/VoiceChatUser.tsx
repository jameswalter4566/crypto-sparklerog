import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceChatUserProps {
  user: {
    id: number;
    username: string;
    avatar: string;
    isMuted: boolean;
    isTalking: boolean;
    solBalance: number | null;
  };
  onToggleMute: (userId: number) => void;
}

export const VoiceChatUser = ({ user, onToggleMute }: VoiceChatUserProps) => {
  const displayName = user.username?.trim() || "User";

  return (
    <div
      className={`
        flex flex-col items-center p-4 bg-black/20 rounded-lg 
        hover:bg-black/30 transition-colors border border-primary relative
        ${user.isTalking ? 'animate-pulse shadow-[0_0_15px_rgba(153,69,255,0.8)]' : 'shadow-[0_0_15px_rgba(153,69,255,0.5)]'}
      `}
    >
      <Avatar className="w-24 h-24 mb-3">
        <AvatarImage src={user.avatar} alt={displayName} />
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-center">{displayName}</span>
      </div>
      {user.solBalance !== null && (
        <div className="text-xs text-center text-purple-500 font-medium">
          {user.solBalance.toFixed(2)} SOL
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 cursor-pointer"
        onClick={() => onToggleMute(user.id)}
      >
        {user.isMuted ? (
          <MicOff className="h-4 w-4 text-red-500" />
        ) : (
          <Mic className="h-4 w-4 text-green-500" />
        )}
      </Button>
    </div>
  );
};