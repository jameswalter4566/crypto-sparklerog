import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Users, MessageSquare, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StreamViewProps {
  streamId: string;
  username: string;
  title: string;
  avatarUrl?: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export const StreamView = ({
  streamId,
  username,
  title,
  avatarUrl,
  onClose,
}: StreamViewProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: "You",
      message: chatMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatMessage("");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main stream content */}
        <div className="flex-1 bg-card">
          <div className="aspect-video bg-black/90 w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Stream preview coming soon</p>
          </div>
        </div>

        {/* Chat sidebar for larger screens */}
        <div className="w-80 border-l hidden md:flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Stream Chat</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-4">
                <div className="flex items-start gap-2">
                  <p className="font-medium text-sm">{msg.username}:</p>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </div>

        {/* Mobile chat sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-4 rounded-full md:hidden"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Stream Chat</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4 h-[calc(100vh-10rem)]">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-4">
                  <div className="flex items-start gap-2">
                    <p className="font-medium text-sm">{msg.username}:</p>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border-t p-4 flex justify-center">
        <Button
          variant={isMuted ? "secondary" : "default"}
          size="lg"
          onClick={toggleMute}
          className="w-40"
        >
          {isMuted ? (
            <MicOff className="mr-2 h-5 w-5" />
          ) : (
            <Mic className="mr-2 h-5 w-5" />
          )}
          {isMuted ? "Unmute" : "Mute"}
        </Button>
      </div>
    </div>
  );
};