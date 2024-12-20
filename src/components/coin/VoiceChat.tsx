import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceChatRoom } from "../voice-chat/VoiceChatRoom";
import { AgoraRTCProvider } from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { ClientConfig } from "agora-rtc-sdk-ng";
import type { IAgoraRTCClient } from "agora-rtc-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceChatProps {
  coinId: string;
}

const config: ClientConfig = {
  mode: "rtc",
  codec: "vp8"
};

const client = AgoraRTC.createClient(config) as unknown as IAgoraRTCClient;

export const VoiceChat = ({ coinId }: VoiceChatProps) => {
  const [isJoined, setIsJoined] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get the user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_address, display_name, avatar_url')
            .eq('wallet_address', session.user.id)
            .maybeSingle();
          
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_address, display_name, avatar_url')
          .eq('wallet_address', session.user.id)
          .maybeSingle();
        
        if (profile) {
          setUserProfile(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        if (isJoined) {
          setIsJoined(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isJoined]);

  const handleJoinVoiceChat = () => {
    if (!userProfile) {
      toast.error("Please connect your wallet to join voice chat");
      return;
    }
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
              disabled={isLoading || !userProfile}
            >
              <Mic className="h-5 w-5" />
              Join Voice Chat
            </Button>
            <p className="text-sm text-muted-foreground">
              {isLoading 
                ? "Loading..."
                : userProfile 
                  ? "Join the voice chat to discuss with other traders"
                  : "Please connect your wallet to join voice chat"}
            </p>
          </div>
        ) : (
          <VoiceChatRoom
            channelName={`coin-${coinId}`}
            onLeave={handleLeaveVoiceChat}
            userProfile={userProfile}
          />
        )}
      </AgoraRTCProvider>
    </Card>
  );
};