import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useState } from "react";
import { VoiceChatRoom } from "../voice-chat/VoiceChatRoom";
import { AgoraRTCProvider, createClient } from "agora-rtc-react";

interface VoiceChatProps {
  coinId: string;
}

// Initialize AgoraRTC client using agora-rtc-react's createClient
const client = createClient({ 
  mode: "rtc", 
  codec: "vp8" 
});

export const VoiceChat = ({ coinId }: VoiceChatProps) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinVoiceChat = () => {
    setIsJoined(true);
  };

  const handleLeaveVoiceChat = () => {
    setIsJoined(false);
  };

  return (
    <Card className="mt-6 p-6 min-h-[400px] w-full bg-card">
      <AgoraRTCProvider client={client}>
        {!isJoined ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Button
              size="lg"
              onClick={handleJoinVoiceChat}
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              Join Voice Chat
            </Button>
            <p className="text-sm text-muted-foreground">
              Join the voice chat to discuss with other traders
            </p>
          </div>
        ) : (
          <VoiceChatRoom
            channelName={`coin-${coinId}`}
            onLeave={handleLeaveVoiceChat}
          />
        )}
      </AgoraRTCProvider>
    </Card>
  );
};