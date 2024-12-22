import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVoiceChatUsers } from "@/hooks/useVoiceChatUsers";

interface VoiceChatCounterProps {
  coinId: string;
}

export function VoiceChatCounter({ coinId }: VoiceChatCounterProps) {
  const userCount = useVoiceChatUsers(coinId);

  return (
    <Badge variant="secondary" className="gap-1">
      <Users className="h-3 w-3" />
      {userCount}
    </Badge>
  );
}