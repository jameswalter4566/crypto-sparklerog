import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StreamTile } from "@/components/stream/StreamTile";
import { StreamView } from "@/components/stream/StreamView";
import { Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWalletConnection } from "@/hooks/useWalletConnection";

interface Stream {
  id: string;
  username: string;
  title: string;
  viewerCount: number;
  avatarUrl?: string | null;
}

const LiveStream = () => {
  const { toast } = useToast();
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { walletAddress, connected } = useWalletConnection(() => Promise.resolve());
  const [activeStreams, setActiveStreams] = useState<Stream[]>([]);

  const handleStartStreamClick = () => {
    if (!connected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to start streaming",
        variant: "destructive",
      });
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleStartActualStream = async () => {
    setIsLoading(true);
    try {
      const streamId = `stream_${Date.now()}`;
      const newStream = {
        id: streamId,
        username: walletAddress?.slice(0, 8) || 'Anonymous',
        title: "Live Trading Session",
        viewerCount: 0,
      };

      setActiveStreams(prev => [...prev, newStream]);
      setIsPreviewOpen(false);
      setSelectedStream(newStream);

      toast({
        title: "Stream Started",
        description: "Your stream is now live!",
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      toast({
        title: "Error",
        description: "Failed to start stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatch = (stream: Stream) => {
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
        isStreamer={selectedStream.username === walletAddress?.slice(0, 8)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Streams</h1>
        <Button onClick={handleStartStreamClick} size="lg">
          <Video className="w-5 h-5 mr-2" />
          Start Streaming
        </Button>
      </div>

      {activeStreams.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No active streams at the moment
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeStreams.map((stream) => (
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[80%] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Stream Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
            <StreamView
              streamId={`preview_${walletAddress}`}
              username={walletAddress?.slice(0, 8) || 'Anonymous'}
              title="Stream Preview"
              isStreamer={true}
              isPreview={true}
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setIsPreviewOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              size="lg"
              onClick={handleStartActualStream}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Begin Stream
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveStream;