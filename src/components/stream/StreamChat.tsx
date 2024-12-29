import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
  wallet_address: string;
}

interface StreamChatProps {
  streamId: string;
  username: string;
  walletAddress: string;
}

// Simple profanity filter - this should be expanded with a more comprehensive list
const containsInappropriateContent = (text: string): boolean => {
  const inappropriateWords = [
    'nigga', 'butt', // Add more words to filter
  ];
  return inappropriateWords.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
};

const filterUsername = (username: string): string => {
  return containsInappropriateContent(username) ? '[Moderated]' : username;
};

const filterMessage = (message: string): string => {
  return containsInappropriateContent(message) ? '[Message removed for inappropriate content]' : message;
};

export function StreamChat({ streamId, username, walletAddress }: StreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('stream_messages')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[StreamChat] Error fetching messages:', error);
        return;
      }

      // Filter messages before setting them
      const filteredData = data?.map(msg => ({
        ...msg,
        username: filterUsername(msg.username),
        message: filterMessage(msg.message)
      }));

      setMessages(filteredData || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('stream_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_messages',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          console.log('[StreamChat] New message received:', payload.new);
          const newMessage = payload.new as ChatMessage;
          // Filter new message before adding it
          setMessages(current => [...current, {
            ...newMessage,
            username: filterUsername(newMessage.username),
            message: filterMessage(newMessage.message)
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Check for inappropriate content before sending
    if (containsInappropriateContent(chatMessage)) {
      toast.error("Your message contains inappropriate content");
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
      console.log('[StreamChat] Message sent successfully by:', username);
      setChatMessage("");
    } catch (error) {
      console.error('[StreamChat] Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Live Chat</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-card/50 rounded-lg p-3 animate-fade-in ${
                msg.wallet_address === walletAddress ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-primary">
                  {filterUsername(msg.username)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{filterMessage(msg.message)}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
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
    </div>
  );
}