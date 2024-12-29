import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageSquare, Share2, Users } from "lucide-react";

interface StreamViewProps {
  username: string;
  avatarUrl?: string | null;
  title: string;
  viewerCount: number;
  isLive?: boolean;
}

export const StreamView = ({ username, avatarUrl, title, viewerCount, isLive = true }: StreamViewProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-[1920px] mx-auto p-4">
      {/* Main Content - Stream and Info */}
      <div className="flex-1">
        {/* Stream Window */}
        <div className="relative aspect-video bg-black/90 rounded-lg mb-4">
          <div className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
          <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{viewerCount}</span>
          </div>
        </div>

        {/* Stream Info */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-primary">{username}</span>
              <span>•</span>
              <span>{viewerCount} viewers</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Heart className="w-4 h-4 mr-2" />
              Follow
            </Button>
            <Button variant="secondary">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <Card className="w-full lg:w-[400px] h-[calc(100vh-2rem)] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Stream Chat
          </h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Placeholder messages */}
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-primary">User123:</span>
              <span className="ml-2">Great stream!</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-primary">Trader789:</span>
              <span className="ml-2">What's your take on the market today?</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <input
            type="text"
            placeholder="Send a message"
            className="w-full px-4 py-2 rounded-md bg-background border"
          />
        </div>
      </Card>
    </div>
  );
};