import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { StreamView } from "@/components/stream/StreamView";
import { StreamGrid } from "@/components/stream/StreamGrid";
import { useActiveStreams, type Stream } from "@/hooks/useActiveStreams";
import { supabase } from "@/integrations/supabase/client";

const LiveStream = () => {
  const { toast } = useToast();
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { walletAddress, connected } = useWalletConnection(() => Promise.resolve());
  const { streams } = useActiveStreams();

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
      
      // Create the stream record in the database
      const { error: insertError } = await supabase
        .from('active_streams')
        .insert({
          id: streamId,
          wallet_address: walletAddress,
          username: walletAddress?.slice(0, 8) || "Anonymous",
          title: "Live Trading Session",
          viewer_count: 0
        });

      if (insertError) {
        throw insertError;
      }

      const newStream = {
        id: streamId,
        username: walletAddress?.slice(0, 8) || "Anonymous",
        title: "Live Trading Session",
        viewerCount: 0,
      };

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

  const handleStreamEnd = async () => {
    if (selectedStream) {
      try {
        const { error } = await supabase
          .from('active_streams')
          .delete()
          .eq('id', selectedStream.id);

        if (error) throw error;

        setSelectedStream(null);
        toast({
          title: "Stream Ended",
          description: "Your stream has been ended successfully.",
        });
      } catch (error) {
        console.error("Error ending stream:", error);
        toast({
          title: "Error",
          description: "Failed to end stream properly. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (selectedStream) {
    return (
      <StreamView
        streamId={selectedStream.id}
        username={selectedStream.username}
        title={selectedStream.title}
        avatarUrl={selectedStream.avatarUrl}
        onClose={handleStreamEnd}
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

      <StreamGrid streams={streams} onWatch={setSelectedStream} />

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[80%] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Stream Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
            <StreamView
              streamId={`preview_${walletAddress}`}
              username={walletAddress?.slice(0, 8) || "Anonymous"}
              title="Stream Preview"
              isStreamer={true}
              isPreview={true}
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" size="lg" onClick={() => setIsPreviewOpen(false)}>
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