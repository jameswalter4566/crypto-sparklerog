import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Comment } from "./types";
import { useMemo } from "react";

const cardColors = [
  'rgba(242, 252, 226, 0.05)', // Soft Green
  'rgba(254, 247, 205, 0.05)', // Soft Yellow
  'rgba(254, 198, 161, 0.05)', // Soft Orange
  'rgba(255, 222, 226, 0.05)', // Soft Pink
  'rgba(253, 225, 211, 0.05)', // Soft Peach
  'rgba(211, 228, 253, 0.05)', // Soft Blue
  'rgba(241, 240, 251, 0.05)', // Soft Purple
  'rgba(255, 236, 217, 0.05)', // Soft Cream
  'rgba(217, 255, 236, 0.05)', // Mint
  'rgba(236, 217, 255, 0.05)', // Lavender
];

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Assign a random color to each comment
  const commentColors = useMemo(() => {
    return comments.map(() => cardColors[Math.floor(Math.random() * cardColors.length)]);
  }, [comments.length]);

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 rounded-lg border transition-all duration-300"
              style={{ 
                backgroundColor: commentColors[index],
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
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
  );
}