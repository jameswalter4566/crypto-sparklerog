import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { ProfileSetup } from "./wallet/ProfileSetup";
import { ProfileAvatar } from "./wallet/ProfileAvatar";
import { Settings } from "./wallet/Settings";

export const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadProfile = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('wallet_address', address)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) {
        setDisplayName(data.display_name);
        setAvatarUrl(data.avatar_url);
        setShowProfileSetup(false);
      } else {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error("Error in loadProfile:", error);
    }
  };

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
        toast.error("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
        return;
      }

      // Try to reconnect to an existing session first
      try {
        const resp = await solana.connect({ onlyIfTrusted: true });
        const address = resp.publicKey.toString();
        setWalletAddress(address);
        setConnected(true);
        toast.success("Wallet reconnected!");
        await loadProfile(address);
        return;
      } catch (e) {
        // No trusted connection, proceed with new connection
        console.log("No trusted connection found, requesting new connection");
      }

      const response = await solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      setWalletAddress(address);
      setConnected(true);
      toast.success("Wallet connected!");
      await loadProfile(address);

      // Store connection in localStorage
      localStorage.setItem('phantomConnected', 'true');
    } catch (error) {
      console.error(error);
      toast.error("Error connecting wallet");
    }
  };

  const disconnectWallet = async () => {
    try {
      // @ts-ignore
      const { solana } = window;
      if (solana) {
        await solana.disconnect();
        setConnected(false);
        setWalletAddress(null);
        setShowProfileSetup(false);
        setDisplayName(null);
        setAvatarUrl(null);
        // Clear localStorage on manual disconnect
        localStorage.removeItem('phantomConnected');
        toast.success("Wallet disconnected!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error disconnecting wallet");
    }
  };

  const handleProfileSaved = (newDisplayName: string, newAvatarUrl: string | null) => {
    setDisplayName(newDisplayName);
    setAvatarUrl(newAvatarUrl);
    setShowProfileSetup(false);
  };

  useEffect(() => {
    const initializeWallet = async () => {
      // @ts-ignore
      const { solana } = window;
      
      // Check if we have a stored connection and Phantom is available
      const wasConnected = localStorage.getItem('phantomConnected') === 'true';
      
      if (wasConnected && solana?.isPhantom) {
        try {
          const response = await solana.connect({ onlyIfTrusted: true });
          const address = response.publicKey.toString();
          setWalletAddress(address);
          setConnected(true);
          await loadProfile(address);
        } catch (error) {
          console.error("Error reconnecting:", error);
          // Clear localStorage if auto-reconnect fails
          localStorage.removeItem('phantomConnected');
        }
      }
    };

    initializeWallet();
  }, []);

  return (
    <>
      {connected ? (
        <div className="fixed top-4 right-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ProfileAvatar 
              displayName={displayName}
              avatarUrl={avatarUrl}
              size="sm"
            />
            <span className="text-white">{displayName}</span>
          </div>
          {walletAddress && (
            <Settings
              walletAddress={walletAddress}
              currentDisplayName={displayName}
              onProfileUpdate={handleProfileSaved}
            />
          )}
          <button
            onClick={disconnectWallet}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
            aria-label="Disconnect wallet"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="fixed top-4 right-4 hover:opacity-80 transition-opacity"
        >
          <img
            src="/1200x1200.png"
            alt="Phantom Wallet"
            className="w-10 h-10 rounded-full"
          />
          <span className="sr-only">Connect Phantom Wallet</span>
        </button>
      )}

      <ProfileSetup
        open={showProfileSetup}
        onOpenChange={setShowProfileSetup}
        walletAddress={walletAddress}
        onProfileSaved={handleProfileSaved}
      />
    </>
  );
};