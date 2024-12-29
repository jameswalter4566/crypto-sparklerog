import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  wallet_address: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CoinCommentsProps {
  coinId: string;
}

export function CoinComments({ coinId }: CoinCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    const unsubscribe = subscribeToComments();
    return () => {
      unsubscribe();
    };
  }, [coinId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("coin_comments")
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq("coin_id", coinId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error("Error in fetchComments:", error);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel("coin-comments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coin_comments",
          filter: `coin_id=eq.${coinId}`,
        },
        (payload) => {
          console.log("Comment change received:", payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    
    try {
      // @ts-ignore
      const { solana } = window;
      
      if (!solana?.isPhantom || !solana.isConnected) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please connect your Phantom wallet to comment.",
        });
        setIsLoading(false);
        return;
      }

      const walletAddress = solana.publicKey.toString();
      console.log("Using wallet address:", walletAddress);

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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit comment. Please try again.",
        });
        return;
      }

      setNewComment("");
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    } catch (error) {
      console.error("Error in handleSubmitComment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit comment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      
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
          className="w-full sm:w-auto"
        >
          {isLoading ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-4 p-4 rounded-lg bg-card border"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.profiles?.avatar_url || ""} />
                  <AvatarFallback>
                    {comment.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {comment.profiles?.display_name || "Anonymous"}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
        )}
      </ScrollArea>
    </div>
  );
}