import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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

// Create client outside component to prevent recreation
const client = AgoraRTC.createClient(config) as unknown as IAgoraRTCClient;

const VOICE_CHAT_STATE_KEY = 'voiceChatState';

export const VoiceChat = ({ coinId }: VoiceChatProps) => {
  const [isJoined, setIsJoined] = useState(() => {
    const savedState = localStorage.getItem(VOICE_CHAT_STATE_KEY);
    if (savedState) {
      const { joined, channelId } = JSON.parse(savedState);
      return joined && channelId === coinId;
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  const checkWalletAndProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      // @ts-ignore
      const { solana } = window;
      
      if (solana?.isPhantom && solana.isConnected) {
        const address = solana.publicKey.toString();
        console.log("Wallet connected:", address);
        setWalletConnected(true);
        
        // Use proper URL formatting for the API call
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('wallet_address, display_name, avatar_url')
          .eq('wallet_address', address)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Error loading profile");
          setUserProfile(null);
        } else {
          console.log("Profile data:", profile);
          setUserProfile(profile || null);
        }
      } else {
        console.log("Wallet not connected");
        setWalletConnected(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error checking wallet and profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isJoined) {
      localStorage.setItem(VOICE_CHAT_STATE_KEY, JSON.stringify({
        joined: true,
        channelId: coinId
      }));
    } else {
      localStorage.removeItem(VOICE_CHAT_STATE_KEY);
    }
  }, [isJoined, coinId]);

  useEffect(() => {
    checkWalletAndProfile();

    // @ts-ignore
    const { solana } = window;
    if (!solana) {
      console.log("Phantom wallet not found");
      return;
    }

    const onConnect = () => {
      console.log("Wallet connected event");
      checkWalletAndProfile();
    };
    const onDisconnect = () => {
      console.log("Wallet disconnected event");
      setWalletConnected(false);
      setUserProfile(null);
      handleLeaveVoiceChat();
    };

    solana.on('connect', onConnect);
    solana.on('disconnect', onDisconnect);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isJoined) {
        console.log("Page became visible, checking connection status");
        checkWalletAndProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (solana) {
        solana.removeListener('connect', onConnect);
        solana.removeListener('disconnect', onDisconnect);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkWalletAndProfile, isJoined]);

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
    localStorage.removeItem(VOICE_CHAT_STATE_KEY);
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
              disabled={isLoading}
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
                    ? "Please set up your profile to join voice chat and REFRESH Once Created!"
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