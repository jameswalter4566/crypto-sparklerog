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
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const checkWalletAndProfile = async () => {
      try {
        setIsLoading(true);
        // @ts-ignore
        const { solana } = window;
        
        // Check if wallet is connected
        if (solana?.isPhantom && solana.isConnected) {
          setWalletConnected(true);
          const address = solana.publicKey.toString();
          
          // Get the user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_address, display_name, avatar_url')
            .eq('wallet_address', address)
            .maybeSingle();
          
          if (profile) {
            setUserProfile(profile);
          }
        } else {
          setWalletConnected(false);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error checking wallet and profile:", error);
        toast.error("Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletAndProfile();

    // Listen for wallet connection changes
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      solana.on('connect', checkWalletAndProfile);
      solana.on('disconnect', () => {
        setWalletConnected(false);
        setUserProfile(null);
        if (isJoined) {
          setIsJoined(false);
        }
      });

      return () => {
        solana.removeListener('connect', checkWalletAndProfile);
        solana.removeListener('disconnect', () => {});
      };
    }
  }, [isJoined]);

  const handleJoinVoiceChat = () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet to join voice chat");
      return;
    }
    if (!userProfile) {
      toast.error("Please set up your profile to join voice chat");
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
              disabled={isLoading || !walletConnected || !userProfile}
            >
              <Mic className="h-5 w-5" />
              Join Voice Chat
            </Button>
            <p className="text-sm text-muted-foreground">
              {isLoading 
                ? "Loading..."
                : !walletConnected
                  ? "Please connect your wallet to join voice chat"
                  : !userProfile
                    ? "Please set up your profile to join voice chat"
                    : "Join the voice chat to discuss with other traders"}
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