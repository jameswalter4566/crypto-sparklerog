import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, Play } from "lucide-react";

interface StreamTileProps {
  username: string;
  avatarUrl?: string;
  viewerCount: number;
  title: string;
  onWatch: () => void;
}

export const StreamTile = ({ username, avatarUrl, viewerCount, title, onWatch }: StreamTileProps) => {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
      <CardHeader className="relative p-0 aspect-video bg-gradient-to-br from-purple-900/80 to-gray-900">
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{viewerCount}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold truncate">{username}</h3>
            <p className="text-sm text-muted-foreground truncate">{title}</p>
          </div>
        </div>
        <Button 
          onClick={onWatch} 
          className="w-full"
          variant="secondary"
        >
          <Play className="w-4 h-4 mr-2" />
          Watch Stream
        </Button>
      </CardContent>
    </Card>
  );
};