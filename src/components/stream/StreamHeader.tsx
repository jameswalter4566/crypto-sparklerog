import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreamHeaderProps {
  username: string;
  title: string;
  avatarUrl?: string;
  viewerCount: number;
  onClose: () => void;
  onEndStream?: () => void;
  isStreamer?: boolean;
}

export function StreamHeader({
  username,
  title,
  avatarUrl,
  viewerCount,
  onClose,
  onEndStream,
  isStreamer
}: StreamHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{username}</h3>
          <p className="text-sm text-muted-foreground truncate">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{viewerCount}</span>
        </div>
        {isStreamer && onEndStream && (
          <Button 
            onClick={onEndStream}
            variant="destructive"
            size={isMobile ? "sm" : "default"}
            className="hidden sm:flex"
          >
            End Stream
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}