import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import type { Comment } from "./types";

interface CoinCommentsProps {
  coinId: string;
}

export function CoinComments({ coinId }: CoinCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <CommentForm coinId={coinId} onCommentPosted={fetchComments} />
      <CommentList comments={comments} />
    </div>
  );
}