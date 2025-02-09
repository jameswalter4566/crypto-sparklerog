import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";

interface ConnectButtonProps {
  connected: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  balance: number | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const ConnectButton = ({
  connected,
  displayName,
  avatarUrl,
  balance,
  onConnect,
  onDisconnect
}: ConnectButtonProps) => {
  if (connected) {
    return (
      <div className="flex items-center gap-4">
        {balance !== null && (
          <div className="text-purple-500 font-medium text-lg">
            {balance.toFixed(2)} SOL
          </div>
        )}
        <div className="flex items-center gap-2">
          <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
          <span className="text-white">{displayName || "Unknown User"}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="hover:opacity-80 transition-opacity"
    >
      <img
        src="/1200x1200.png"
        alt="Phantom Wallet"
        className="w-10 h-10 rounded-full"
      />
      <span className="sr-only">Connect Phantom Wallet</span>
    </button>
  );
};