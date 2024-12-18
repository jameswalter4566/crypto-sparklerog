import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceChatUserProps {
  user: {
    id: number;
    username: string;
    avatar: string;
    isMuted: boolean;
    tokenHolding: {
      amount: string;
      percentage: number;
    };
  };
  onToggleMute: (userId: number) => void;
}

export const VoiceChatUser = ({ user, onToggleMute }: VoiceChatUserProps) => {
  return (
    <div className="flex flex-col items-center p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors shadow-[0_0_15px_rgba(153,69,255,0.5)] border border-primary relative">
      <Avatar className="w-24 h-24 mb-3">
        <AvatarImage src={user.avatar} alt={user.username} />
        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-center mb-2">{user.username}</span>
      <div className="text-xs text-center text-muted-foreground">
        <div>${user.tokenHolding.amount}</div>
        <div className={user.tokenHolding.percentage > 20 ? 'text-yellow-500' : 'text-muted-foreground'}>
          {user.tokenHolding.percentage.toFixed(2)}% of supply
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
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