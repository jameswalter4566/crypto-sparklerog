import { useState, useEffect } from "react";
import { usePhantomConnection } from "@/hooks/usePhantomConnection";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "./wallet/ProfileSetup";
import { Settings } from "./wallet/Settings";
import { ConnectButton } from "./wallet/ConnectButton";

export const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const { balance, fetchBalance } = useWalletBalance();

  const loadProfile = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("wallet_address", address)
        .maybeSingle();

      if (error) {
        console.error("[WalletConnect] Error loading profile:", error);
        return;
      }

      if (data) {
        setDisplayName(data.display_name);
        setAvatarUrl(data.avatar_url);
        setShowProfileSetup(false);
        localStorage.setItem(
          "userProfile",
          JSON.stringify({ displayName: data.display_name, avatarUrl: data.avatar_url })
        );
      } else {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error("[WalletConnect] Error in loadProfile:", error);
    }
  };

  const handleProfileSaved = (newDisplayName: string, newAvatarUrl: string | null) => {
    setDisplayName(newDisplayName);
    setAvatarUrl(newAvatarUrl);
    setShowProfileSetup(false);
    localStorage.setItem(
      "userProfile",
      JSON.stringify({ displayName: newDisplayName, avatarUrl: newAvatarUrl })
    );
  };

  const { isConnecting, connectWallet, disconnectWallet } = usePhantomConnection(async (address) => {
    setWalletAddress(address);
    setConnected(true);
    await fetchBalance(address);
    await loadProfile(address);
  });

  useEffect(() => {
    const balanceInterval = setInterval(() => {
      if (walletAddress) {
        fetchBalance(walletAddress);
      }
    }, 30000);

    return () => clearInterval(balanceInterval);
  }, [walletAddress]);

  return (
    <div className="fixed top-4 right-4">
      <ConnectButton
        connected={connected}
        displayName={displayName}
        avatarUrl={avatarUrl}
        balance={balance}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
      {walletAddress && (
        <Settings
          walletAddress={walletAddress}
          currentDisplayName={displayName}
          onProfileUpdate={handleProfileSaved}
        />
      )}
      <ProfileSetup
        open={showProfileSetup}
        onOpenChange={setShowProfileSetup}
        walletAddress={walletAddress}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
};