import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVoiceChatUsers } from "@/hooks/useVoiceChatUsers";

interface VoiceChatCounterProps {
  coinId: string;
}

export function VoiceChatCounter({ coinId }: VoiceChatCounterProps) {
  const userCount = useVoiceChatUsers(coinId);

  return (
    <Badge variant="secondary" className="gap-1.5 px-3 py-1">
      <Users className="h-4 w-4" />
      {userCount}
      <span className="ml-1 text-sm">Active in Voice Chat</span>
    </Badge>
  );
}