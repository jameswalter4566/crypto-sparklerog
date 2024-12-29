import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Stream } from "@/hooks/useActiveStreams";

export const useStreamManagement = (walletAddress: string | null, displayName: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  const startStream = async () => {
    if (!walletAddress || !displayName) {
      toast("Profile Required", {
        description: "Please ensure your wallet is connected and profile is set up",
      });
      return;
    }

    setIsLoading(true);
    try {
      const streamId = `stream_${Date.now()}`;
      
      const { error: insertError } = await supabase
        .from('active_streams')
        .insert({
          id: streamId,
          wallet_address: walletAddress,
          username: displayName,
          title: "Live Trading Session",
          viewer_count: 0
        });

      if (insertError) {
        console.error("Insert Error:", insertError);
        throw insertError;
      }

      const newStream = {
        id: streamId,
        username: displayName,
        title: "Live Trading Session",
        viewerCount: 0,
      };

      setSelectedStream(newStream);

      toast("Stream Started", {
        description: "Your stream is now live!",
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      toast("Error", {
        description: "Failed to start stream. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endStream = async () => {
    if (!walletAddress) {
      toast("Connect Wallet", {
        description: "Please connect your wallet to end the stream",
      });
      return;
    }

    if (selectedStream) {
      try {
        const { error } = await supabase
          .from('active_streams')
          .delete()
          .eq('id', selectedStream.id)
          .eq('wallet_address', walletAddress);

        if (error) throw error;

        setSelectedStream(null);
        toast("Stream Ended", {
          description: "Your stream has been ended successfully.",
        });
      } catch (error) {
        console.error("Error ending stream:", error);
        toast("Error", {
          description: "Failed to end stream properly. Please try again.",
        });
      }
    }
  };

  return {
    isLoading,
    selectedStream,
    setSelectedStream,
    startStream,
    endStream,
  };
};