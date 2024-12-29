import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CommentFormProps {
  coinId: string;
  onCommentPosted: () => void;
}

export function CommentForm({ coinId, onCommentPosted }: CommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    
    try {
      // @ts-ignore
      const { solana } = window;
      
      if (!solana?.isPhantom || !solana.isConnected) {
        toast.error("Please connect your Phantom wallet to comment.");
        return;
      }

      const walletAddress = solana.publicKey.toString();
      console.log("Submitting comment with wallet:", walletAddress);

      const { error } = await supabase
        .from("coin_comments")
        .insert({
          coin_id: coinId,
          content: newComment.trim(),
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error submitting comment:", error);
        toast.error("Failed to submit comment. Please try again.");
        return;
      }

      setNewComment("");
      toast.success("Comment posted successfully!");
      onCommentPosted();
    } catch (error) {
      console.error("Error in handleSubmitComment:", error);
      toast.error("Failed to submit comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="min-h-[100px]"
      />
      <Button 
        onClick={handleSubmitComment} 
        disabled={isLoading || !newComment.trim()}
        className="w-full sm:w-auto animate-glow-pulse bg-primary hover:bg-primary/90 transition-all duration-300"
      >
        {isLoading ? "Posting..." : "Post Comment"}
      </Button>
    </div>
  );
}