import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { StreamView } from "@/components/stream/StreamView";
import { StreamGrid } from "@/components/stream/StreamGrid";
import { useActiveStreams } from "@/hooks/useActiveStreams";
import { StreamPreview } from "@/components/stream/StreamPreview";
import { useStreamManagement } from "@/hooks/useStreamManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LiveStream = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { walletAddress, connected } = useWalletConnection(() => Promise.resolve());
  const { streams } = useActiveStreams();
  const [displayName, setDisplayName] = useState<string | null>(null);
  
  const {
    isLoading,
    selectedStream,
    setSelectedStream,
    startStream,
    endStream,
  } = useStreamManagement(walletAddress, displayName);

  useEffect(() => {
    const loadProfile = async () => {
      if (walletAddress) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('wallet_address', walletAddress)
          .single();

        if (!error && data) {
          setDisplayName(data.display_name);
        }
      }
    };

    loadProfile();
  }, [walletAddress]);

  const handleStartStreamClick = () => {
    if (!connected) {
      toast.error("Please connect your wallet to start streaming");
      return;
    }

    if (!displayName) {
      toast.error("Please set up your profile before streaming");
      return;
    }

    setIsPreviewOpen(true);
  };

  if (selectedStream && walletAddress) {
    return (
      <StreamView
        streamId={selectedStream.id}
        username={selectedStream.username}
        title={selectedStream.title}
        avatarUrl={selectedStream.avatarUrl}
        onClose={endStream}
        isStreamer={selectedStream.username === displayName}
        walletAddress={walletAddress}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center gap-6 mb-8">
        <h1 className="text-3xl font-bold">Live Streams</h1>
        <Button 
          onClick={handleStartStreamClick} 
          size="lg"
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-center"
        >
          <Video className="w-5 h-5 mr-2" />
          Start Streaming
        </Button>
      </div>

      <StreamGrid streams={streams} onWatch={setSelectedStream} />

      <StreamPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onStartStream={startStream}
        isLoading={isLoading}
        walletAddress={walletAddress}
        displayName={displayName}
      />
    </div>
  );
};

export default LiveStream;