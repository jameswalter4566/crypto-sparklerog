import { useState, useEffect } from "react";
import { StreamHeader } from "./StreamHeader";
import { StreamVideo } from "./StreamVideo";
import { StreamChat } from "./StreamChat";
import { StreamControls } from "./StreamControls";
import { StreamLayout } from "./StreamLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { useMockViewers } from "@/hooks/useMockViewers";

interface StreamViewProps {
  streamId: string;
  username: string;
  title: string;
  avatarUrl?: string;
  onClose: () => void;
  isStreamer?: boolean;
  isPreview?: boolean;
  walletAddress: string;
}

type ActiveStream = Database["public"]["Tables"]["active_streams"]["Row"];

export function StreamView({
  streamId,
  username,
  title,
  avatarUrl,
  onClose,
  isStreamer = false,
  isPreview = false,
  walletAddress,
}: StreamViewProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const mockViewers = useMockViewers(isStreamer);

  // Initialize stream or join as viewer
  useEffect(() => {
    if (isPreview) return;

    const initializeStream = async () => {
      try {
        if (isStreamer) {
          // Create new stream
          const { error } = await supabase.from("active_streams").insert({
            id: streamId,
            username: username,
            title: title,
            viewer_count: mockViewers, // Initialize with mock viewers
            wallet_address: walletAddress,
          });

          if (error) throw error;
          toast.success("Stream started successfully!");
        } else {
          // Increment viewer count when joining
          const { error } = await supabase.rpc('increment_viewer_count', {
            stream_id_param: streamId
          });

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error initializing stream:", error);
        toast.error(isStreamer ? "Failed to start stream" : "Failed to join stream");
      }
    };

    initializeStream();

    // Cleanup function
    return () => {
      const cleanupStream = async () => {
        try {
          if (isStreamer) {
            // Delete stream when streamer ends it
            const { error } = await supabase
              .from("active_streams")
              .delete()
              .eq("id", streamId);

            if (error) throw error;
            toast.success("Stream ended");
          } else {
            // Decrement viewer count when leaving
            const { error } = await supabase.rpc('decrement_viewer_count', {
              stream_id_param: streamId
            });

            if (error) throw error;
          }
        } catch (error) {
          console.error("Error cleaning up stream:", error);
          toast.error(isStreamer ? "Failed to end stream properly" : "Failed to leave stream properly");
        }
      };

      cleanupStream();
    };
  }, [streamId, username, title, isStreamer, isPreview, walletAddress, mockViewers]);

  // Update viewer count in database when mock viewers change
  useEffect(() => {
    if (!isStreamer || isPreview) return;

    const updateViewerCount = async () => {
      try {
        const { error } = await supabase
          .from("active_streams")
          .update({ viewer_count: mockViewers })
          .eq("id", streamId);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating viewer count:", error);
      }
    };

    updateViewerCount();
  }, [mockViewers, streamId, isStreamer, isPreview]);

  // Subscribe to viewer count updates
  useEffect(() => {
    if (isPreview) return;

    const channel = supabase
      .channel(`stream_${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_streams',
          filter: `id=eq.${streamId}`
        },
        (payload: RealtimePostgresChangesPayload<ActiveStream>) => {
          if (payload.new && 'viewer_count' in payload.new) {
            setViewerCount(payload.new.viewer_count ?? 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId, isPreview]);

  const handleClose = () => {
    if (isStreamer) {
      if (window.confirm("Are you sure you want to end the stream?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <StreamLayout
      header={
        <StreamHeader
          username={username}
          title={title}
          avatarUrl={avatarUrl}
          viewerCount={isStreamer ? mockViewers : viewerCount}
          onClose={handleClose}
          onEndStream={isStreamer ? handleClose : undefined}
          isStreamer={isStreamer}
        />
      }
      video={
        <StreamVideo
          username={username}
          isStreamer={isStreamer}
          channelName={streamId}
          isPreview={isPreview}
        />
      }
      chat={!isPreview && (
        <StreamChat
          streamId={streamId}
          username={username}
          walletAddress={walletAddress}
        />
      )}
      controls={
        <StreamControls
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isStreamer={isStreamer}
        />
      }
      isPreview={isPreview}
    />
  );
}