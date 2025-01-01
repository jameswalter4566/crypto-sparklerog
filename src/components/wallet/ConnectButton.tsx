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
        <div className="flex flex-col items-end">
          {balance !== null && (
            <div className="text-primary font-medium">
              {balance.toFixed(2)} SOL
            </div>
          )}
          <div className="flex items-center gap-2">
            <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
            <span className="text-white text-sm">{displayName || "Unknown User"}</span>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors text-sm"
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
      className="hover:opacity-80 transition-opacity flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full"
    >
      <img
        src="/1200x1200.png"
        alt="Phantom Wallet"
        className="w-6 h-6 rounded-full"
      />
      <span className="text-primary text-sm font-medium">Connect Wallet</span>
    </button>
  );
};