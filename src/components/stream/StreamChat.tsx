import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface StreamChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  streamId: string;
  username: string;
}

export function StreamChat({ messages, onSendMessage, streamId, username }: StreamChatProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user's wallet address
    const getWalletAddress = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setWalletAddress(session.user.id);
      }
    };
    getWalletAddress();

    // Subscribe to new messages
    const channel = supabase
      .channel('stream-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_messages',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setLocalMessages((prev) => [...prev, {
            id: newMessage.id,
            username: newMessage.username,
            message: newMessage.message,
            timestamp: new Date(newMessage.created_at),
          }]);
        }
      )
      .subscribe();

    // Load existing messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('stream_messages')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast.error("Failed to load chat messages");
        return;
      }

      if (data) {
        setLocalMessages(data.map(msg => ({
          id: msg.id,
          username: msg.username,
          message: msg.message,
          timestamp: new Date(msg.created_at),
        })));
      }
    };

    loadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (!walletAddress) {
      toast.error("Please connect your wallet to chat");
      return;
    }

    try {
      const { error } = await supabase
        .from('stream_messages')
        .insert({
          stream_id: streamId,
          username: username,
          message: chatMessage,
          wallet_address: walletAddress,
        });

      if (error) throw error;
      setChatMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const ChatMessages = () => (
    <div className="space-y-4 p-4">
      {localMessages.map((msg) => (
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