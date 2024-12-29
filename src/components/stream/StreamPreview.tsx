import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StreamView } from "./StreamView";

interface StreamPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStream: () => void;
  isLoading: boolean;
  walletAddress: string | null;
  displayName: string | null;
}

export const StreamPreview = ({
  isOpen,
  onClose,
  onStartStream,
  isLoading,
  walletAddress,
  displayName,
}: StreamPreviewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80%] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Stream Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          <StreamView
            streamId={`preview_${walletAddress}`}
            username={displayName || "Anonymous"}
            title="Stream Preview"
            isStreamer={true}
            isPreview={true}
            onClose={onClose}
          />
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={onStartStream}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Begin Stream
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};