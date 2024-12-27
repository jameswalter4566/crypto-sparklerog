import { VoiceChatUser } from "../coin/VoiceChatUser";

interface Participant {
  id: number;
  username: string;
  avatar: string;
  isMuted: boolean;
  isTalking: boolean;
  solBalance: number | null;
  isVideoEnabled?: boolean;
  videoTrack?: any;
}

interface VoiceChatParticipantsProps {
  participants: Participant[];
  onToggleMute: (userId: number) => void;
  onToggleVideo: (userId: number) => void;
}

export const VoiceChatParticipants = ({ 
  participants, 
  onToggleMute,
  onToggleVideo 
}: VoiceChatParticipantsProps) => {
  if (participants.length === 0) {
    return (
      <p className="text-center text-muted-foreground mt-8">
        No other users in the room
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {participants.map((participant) => (
        <VoiceChatUser 
          key={participant.id} 
          user={participant}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          isLocal={participant.id === participants[0]?.id}
        />
      ))}
    </div>
  );
};