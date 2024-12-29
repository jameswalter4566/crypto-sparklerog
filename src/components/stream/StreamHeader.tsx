import { Button } from "@/components/ui/button";
import { Users, X, Power } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{username}</h2>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{viewerCount}</span>
        </div>
        {isStreamer ? (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onEndStream}
          >
            <Power className="h-4 w-4 mr-2" />
            End Stream
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}