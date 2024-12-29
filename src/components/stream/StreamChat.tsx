import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface StreamChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function StreamChat({ messages, onSendMessage }: StreamChatProps) {
  const [chatMessage, setChatMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    onSendMessage(chatMessage);
    setChatMessage("");
  };

  const ChatMessages = () => (
    <div className="space-y-4 p-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="animate-slide-up opacity-0"
          style={{
            animationFillMode: "forwards",
          }}
        >
          <div className="flex items-start gap-2 bg-card/60 p-2 rounded-lg">
            <p className="font-medium text-sm text-primary">{msg.username}:</p>
            <p className="text-sm text-foreground">{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const ChatForm = () => (
    <form onSubmit={handleSubmit} className="p-4 border-t">
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
  );

  return (
    <>
      {/* Desktop Chat */}
      <div className="w-80 border-l hidden md:flex flex-col bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Stream Chat
          </h3>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col-reverse">
            <ChatMessages />
          </div>
        </div>
        <ChatForm />
      </div>

      {/* Mobile Chat Sheet */}
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
          <div className="flex-1 relative overflow-hidden h-[calc(100vh-10rem)]">
            <div className="absolute inset-0 flex flex-col-reverse">
              <ChatMessages />
            </div>
          </div>
          <ChatForm />
        </SheetContent>
      </Sheet>
    </>
  );
}