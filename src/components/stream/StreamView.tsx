import { useState, useEffect } from "react";
import { StreamHeader } from "./StreamHeader";
import { StreamVideo } from "./StreamVideo";
import { StreamChat, type ChatMessage } from "./StreamChat";
import { StreamControls } from "./StreamControls";
import { StreamLayout } from "./StreamLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StreamViewProps {
  streamId: string;
  username: string;
  title: string;
  avatarUrl?: string;
  onClose: () => void;
  isStreamer?: boolean;
  isPreview?: boolean;
}

export function StreamView({
  streamId,
  username,
  title,
  avatarUrl,
  onClose,
  isStreamer = false,
  isPreview = false,
}: StreamViewProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (isStreamer && !isPreview) {
      const createStream = async () => {
        try {
          const { error } = await supabase.from("active_streams").insert({
            id: streamId,
            wallet_address: username,
            username: username,
            title: title,
            viewer_count: 0,
          });

          if (error) throw error;
          toast.success("Stream started successfully!");
        } catch (error) {
          console.error("Error creating stream:", error);
          toast.error("Failed to start stream");
        }
      };

      createStream();

      return () => {
        const endStream = async () => {
          try {
            const { error } = await supabase
              .from("active_streams")
              .delete()
              .eq("id", streamId);

            if (error) throw error;
            toast.success("Stream ended");
          } catch (error) {
            console.error("Error ending stream:", error);
            toast.error("Failed to end stream properly");
          }
        };

        endStream();
      };
    }
  }, [streamId, username, title, isStreamer, isPreview]);

  useEffect(() => {
    if (!isPreview) {
      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from("active_streams")
            .select("viewer_count")
            .eq("id", streamId)
            .single();

          if (error) throw error;
          if (data) setViewerCount(data.viewer_count);
        } catch (error) {
          console.error("Error fetching viewer count:", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [streamId, isPreview]);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: "You",
      message: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev.slice(-49), newMessage]);
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
          viewerCount={viewerCount}
          onClose={onClose}
          onEndStream={isStreamer ? onClose : undefined}
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
          messages={messages}
          onSendMessage={handleSendMessage}
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