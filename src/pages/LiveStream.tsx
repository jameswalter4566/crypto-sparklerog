import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StreamTile } from "@/components/stream/StreamTile";
import { StreamView } from "@/components/stream/StreamView";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for streams
const mockStreams = [
  {
    id: "1",
    username: "CryptoTrader",
    title: "Live Trading Session - Market Analysis",
    viewerCount: 156,
    avatarUrl: "/player1.png"
  },
  {
    id: "2",
    username: "TokenMaster",
    title: "New Token Launch Discussion",
    viewerCount: 89,
    avatarUrl: null
  },
  {
    id: "3",
    username: "BlockchainGuru",
    title: "Technical Analysis & Price Predictions",
    viewerCount: 234,
    avatarUrl: "/penguin.jpg"
  }
];

const LiveStream = () => {
  const { toast } = useToast();
  const [selectedStream, setSelectedStream] = useState<typeof mockStreams[0] | null>(null);

  const handleStartStream = () => {
    toast({
      title: "Coming Soon",
      description: "Streaming feature will be available in the next update!",
    });
  };

  const handleWatch = (stream: typeof mockStreams[0]) => {
    setSelectedStream(stream);
  };

  if (selectedStream) {
    return (
      <StreamView
        streamId={selectedStream.id}
        username={selectedStream.username}
        title={selectedStream.title}
        avatarUrl={selectedStream.avatarUrl}
        onClose={() => setSelectedStream(null)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Streams</h1>
        <Button onClick={handleStartStream} size="lg">
          <Video className="w-5 h-5 mr-2" />
          Start Streaming
        </Button>
      </div>

      {mockStreams.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No active streams at the moment
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStreams.map((stream) => (
            <StreamTile
              key={stream.id}
              username={stream.username}
              avatarUrl={stream.avatarUrl}
              viewerCount={stream.viewerCount}
              title={stream.title}
              onWatch={() => handleWatch(stream)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveStream;