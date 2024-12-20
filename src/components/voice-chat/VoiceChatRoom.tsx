import { useEffect, useState } from "react";
import { useRTCClient, IAgoraRTCRemoteUser, IMicrophoneAudioTrack } from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { getAgoraAppId, DEFAULT_TOKEN } from "./AgoraConfig";
import { VoiceChatUser } from "../coin/VoiceChatUser";
import { useToast } from "@/components/ui/use-toast";
import AgoraRTC from "agora-rtc-sdk-ng";

interface VoiceChatRoomProps {
  channelName: string;
  onLeave: () => void;
  userProfile: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

const useIsConnected = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);
    return () => setIsConnected(false);
  }, []);

  return isConnected;
};

export const VoiceChatRoom = ({ channelName, onLeave, userProfile }: VoiceChatRoomProps) => {
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
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [calling, setCalling] = useState(false);
  const [agoraAppId, setAgoraAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConnected = useIsConnected();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const initializeAgora = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const appId = await getAgoraAppId();
        
        if (!isMounted) return;

        if (!appId) {
          const errorMsg = "Failed to initialize voice chat. Please try again later.";
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMsg,
          });
          return;
        }
        
        setAgoraAppId(appId);
        setCalling(true);
      } catch (err) {
        console.error('Failed to initialize Agora:', err);
        if (!isMounted) return;
        
        setError("An error occurred while setting up voice chat.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while setting up voice chat.",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAgora();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!agoraAppId || !calling || !userProfile) return;

    const initVoiceChat = async () => {
      try {
        await client.join(agoraAppId, channelName, DEFAULT_TOKEN, null);
        
        // Create and publish local audio track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(audioTrack);
        setLocalAudioTrack(audioTrack);

        // Add current user to the users list
        setUsers([{
          id: client.uid as number,
          username: userProfile.display_name || "Anonymous",
          avatar: userProfile.avatar_url || "/placeholder.svg",
          isMuted: false,
          isTalking: false,
          tokenHolding: {
            amount: "1000",
            percentage: 25
          }
        }]);

        // Set up user-joined event handler
        client.on("user-joined", (user: IAgoraRTCRemoteUser) => {
          setUsers(prev => [...prev, {
            id: user.uid as number,
            username: "Remote User",
            avatar: "/placeholder.svg",
            isMuted: false,
            isTalking: false,
            tokenHolding: {
              amount: "1000",
              percentage: 25
            }
          }]);
        });

        // Set up user-left event handler
        client.on("user-left", (user: IAgoraRTCRemoteUser) => {
          setUsers(prev => prev.filter(u => u.id !== user.uid));
        });

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
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      client.leave();
    };
  }, [agoraAppId, calling, channelName, client, isConnected, toast, userProfile]);

  const handleToggleMute = async (userId: number) => {
    if (userId === client.uid && localAudioTrack) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      if (newMutedState) {
        await localAudioTrack.setEnabled(false);
      } else {
        await localAudioTrack.setEnabled(true);
      }
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isMuted: newMutedState } : user
        )
      );
    }
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