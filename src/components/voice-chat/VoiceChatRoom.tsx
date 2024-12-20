import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { VoiceChatControls } from "./VoiceChatControls";
import { VoiceChatParticipants } from "./VoiceChatParticipants";
import { useVoiceChat } from "./useVoiceChat";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave: () => void;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

const AGORA_APP_ID = "c6f7a2828b774baebabd8ece87268954";

export const VoiceChatRoom = ({ channelName, onLeave, userProfile }: VoiceChatRoomProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { participants, isMuted, handleToggleMute } = useVoiceChat({
    channelName,
    userProfile,
    agoraAppId: AGORA_APP_ID
  });

  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!AGORA_APP_ID) {
        throw new Error("Failed to initialize voice chat. Please try again later.");
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize Agora:', err);
      const errorMsg = err instanceof Error ? err.message : "An error occurred while setting up voice chat.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      setIsLoading(false);
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Initializing voice chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onLeave}>Close</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <VoiceChatControls
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onLeave={onLeave}
      />
      <VoiceChatParticipants
        participants={participants}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
};