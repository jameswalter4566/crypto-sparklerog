import { useEffect, useState } from "react";
import { useRTCClient } from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { getAgoraAppId, DEFAULT_TOKEN } from "./AgoraConfig";
import { VoiceChatUser } from "../coin/VoiceChatUser";
import { useToast } from "@/components/ui/use-toast";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave: () => void;
}

const useIsConnected = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);
    return () => setIsConnected(false);
  }, []);

  return isConnected;
};

export const VoiceChatRoom = ({ channelName, onLeave }: VoiceChatRoomProps) => {
  const client = useRTCClient();
  const [users, setUsers] = useState<Array<{
    id: number;
    username: string;
    avatar: string;
    isMuted: boolean;
    isTalking: boolean;
    tokenHolding: {
      amount: string;
      percentage: number;
    };
  }>>([]);
  const [calling, setCalling] = useState(false);
  const [agoraAppId, setAgoraAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConnected = useIsConnected();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAgora = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const appId = await getAgoraAppId();
        
        if (!appId) {
          setError("Voice chat is currently unavailable. Please try again later.");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Voice chat is currently unavailable. Please try again later.",
          });
          return;
        }
        
        setAgoraAppId(appId);
        setCalling(true);
      } catch (err) {
        console.error('Failed to initialize Agora:', err);
        setError("An error occurred while setting up voice chat.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while setting up voice chat.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAgora();
  }, [toast]);

  useEffect(() => {
    if (!agoraAppId || !calling) return;

    const initVoiceChat = async () => {
      try {
        await client.join(agoraAppId, channelName, DEFAULT_TOKEN, null);
        console.log("Joined voice chat successfully");
        
        // Add a mock user for testing
        setUsers([{
          id: 1,
          username: "Test User",
          avatar: "/placeholder.svg",
          isMuted: false,
          isTalking: false,
          tokenHolding: {
            amount: "1000",
            percentage: 25
          }
        }]);
      } catch (error) {
        console.error("Error joining voice chat:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to join voice chat. Please try again.",
        });
      }
    };

    if (isConnected) {
      initVoiceChat();
    }

    return () => {
      client.leave();
    };
  }, [agoraAppId, calling, channelName, client, isConnected, toast]);

  const handleToggleMute = (userId: number) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isMuted: !user.isMuted } : user
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Initializing voice chat...</p>
      </div>
    );
  }

  if (error || !agoraAppId) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">
          {error || "Voice chat is currently unavailable. Please try again later."}
        </p>
        <Button onClick={onLeave}>Close</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Voice Chat Room</h3>
        <Button variant="destructive" onClick={onLeave}>
          Leave
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <VoiceChatUser 
            key={user.id} 
            user={user}
            onToggleMute={handleToggleMute}
          />
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No other users in the room
        </p>
      )}
    </div>
  );
};