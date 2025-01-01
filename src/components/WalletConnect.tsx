import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "./wallet/ProfileSetup";
import { Settings } from "./wallet/Settings";
import { ConnectButton } from "./wallet/ConnectButton";
import { usePhantomMobile } from "@/hooks/usePhantomMobile";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { isMobileDevice, openPhantomApp } = usePhantomMobile();
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

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    try {
      console.log("Starting wallet connection...");
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
        console.log("Phantom not detected, handling mobile/desktop differently");
        if (isMobileDevice()) {
          console.log("Mobile device detected, opening Phantom app...");
          await openPhantomApp();
          return;
        } else {
          console.log("Desktop device detected, opening Phantom website...");
          window.open("https://phantom.app/", "_blank");
          return;
        }
      }

      console.log("Phantom detected, attempting connection...");
      const response = await solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      console.log("Connection successful:", address);
      handleSuccessfulConnection(address);
    } catch (error) {
      console.error("[WalletConnect] Error connecting wallet:", error);
      toast.error("Error connecting wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSuccessfulConnection = async (address: string) => {
    console.log("Handling successful connection for address:", address);
    setWalletAddress(address);
    setConnected(true);
    await fetchBalance(address);
    toast.success("Wallet connected!");
    await loadProfile(address);

    localStorage.setItem("phantomConnected", "true");
    localStorage.setItem("walletAddress", address);
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

        localStorage.removeItem("phantomConnected");
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("userProfile");

        toast.success("Wallet disconnected!");
      }
    } catch (error) {
      console.error("[WalletConnect] Error disconnecting wallet:", error);
      toast.error("Error disconnecting wallet");
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

  useEffect(() => {
    const initializeWallet = async () => {
      console.log("Initializing wallet...");
      // @ts-ignore
      const { solana } = window;

      const wasConnected = localStorage.getItem("phantomConnected") === "true";
      const savedWalletAddress = localStorage.getItem("walletAddress");
      const savedProfile = localStorage.getItem("userProfile");

      if (wasConnected && solana?.isPhantom && savedWalletAddress) {
        try {
          console.log("Attempting to reconnect to wallet...");
          const response = await solana.connect({ onlyIfTrusted: true });
          const address = response.publicKey.toString();
          handleSuccessfulConnection(address);

          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            setDisplayName(parsedProfile.displayName || null);
            setAvatarUrl(parsedProfile.avatarUrl || null);
          } else {
            await loadProfile(address);
          }
        } catch (error) {
          console.error("[WalletConnect] Error reconnecting:", error);
          localStorage.removeItem("phantomConnected");
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("userProfile");
        }
      }
    };

    initializeWallet();

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