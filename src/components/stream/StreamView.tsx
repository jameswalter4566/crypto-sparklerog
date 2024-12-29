import { useState } from "react";
import { StreamHeader } from "./StreamHeader";
import { StreamVideo } from "./StreamVideo";
import { StreamChat, type ChatMessage } from "./StreamChat";
import { StreamControls } from "./StreamControls";

interface StreamViewProps {
  streamId: string;
  username: string;
  title: string;
  avatarUrl?: string;
  onClose: () => void;
  isStreamer?: boolean;
}

export function StreamView({
  streamId,
  username,
  title,
  avatarUrl,
  onClose,
  isStreamer = false,
}: StreamViewProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount] = useState(Math.floor(Math.random() * 100) + 1);

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
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <StreamHeader
        username={username}
        title={title}
        avatarUrl={avatarUrl}
        viewerCount={viewerCount}
        onClose={onClose}
      />

      <div className="flex-1 flex">
        <StreamVideo
          username={username}
          isStreamer={isStreamer}
          channelName={streamId}
        />
        <StreamChat messages={messages} onSendMessage={handleSendMessage} />
      </div>

      <StreamControls
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isStreamer={isStreamer}
      />
    </div>
  );
}