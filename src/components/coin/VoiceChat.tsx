import { Card } from "@/components/ui/card";
import { VoiceChatUser } from "./VoiceChatUser";
import { useState, useEffect } from "react";

const mockVoiceChatUsers = [
  { 
    id: 1, 
    username: "Meme_boss", 
    avatar: "/penguin.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "2,450", percentage: 8.45 }
  },
  { 
    id: 2, 
    username: "To_the_moon", 
    avatar: "/robotchinese.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "6,780", percentage: 22.31 }
  },
  { 
    id: 3, 
    username: "hey_lil_bro", 
    avatar: "/armadillo.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "1,230", percentage: 4.12 }
  },
  { 
    id: 4, 
    username: "Chief_mogger", 
    avatar: "/blakccat.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "890", percentage: 2.98 }
  },
  { 
    id: 5, 
    username: "Diamond_Hands", 
    avatar: "/BAILYTHEBLUECAT.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "1,670", percentage: 5.59 }
  },
  { 
    id: 6, 
    username: "Rocket_Rider", 
    avatar: "/unicornfartdust.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "945", percentage: 3.16 }
  },
  { 
    id: 7, 
    username: "Moon_Walker", 
    avatar: "/penguin.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "1,890", percentage: 6.32 }
  },
  { 
    id: 8, 
    username: "Crypto_King", 
    avatar: "/robotchinese.jpg", 
    isMuted: false,
    isTalking: false,
    tokenHolding: { amount: "2,340", percentage: 7.82 }
  }
];

export const VoiceChat = () => {
  const [users, setUsers] = useState(mockVoiceChatUsers);

  const toggleMute = (userId: number) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isMuted: !user.isMuted } : user
      )
    );
  };

  useEffect(() => {
    // Simulate Meme_boss talking
    const memeBossTalkingTimeout = setTimeout(() => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.username === "Meme_boss" ? { ...user, isTalking: true } : user
        )
      );

      // Stop Meme_boss talking and start To_the_moon talking after 3 seconds
      setTimeout(() => {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.username === "Meme_boss" 
              ? { ...user, isTalking: false }
              : user.username === "To_the_moon"
              ? { ...user, isTalking: true }
              : user
          )
        );

        // Stop To_the_moon talking after another 3 seconds
        setTimeout(() => {
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.username === "To_the_moon" ? { ...user, isTalking: false } : user
            )
          );
        }, 3000);
      }, 3000);
    }, 500);

    return () => {
      clearTimeout(memeBossTalkingTimeout);
    };
  }, []);

  return (
    <Card className="mt-6 p-6 min-h-[400px] w-full bg-card">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <VoiceChatUser
            key={user.id}
            user={user}
            onToggleMute={toggleMute}
          />
        ))}
      </div>
    </Card>
  );
};