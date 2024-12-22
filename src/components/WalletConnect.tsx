import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { ProfileSetup } from "./wallet/ProfileSetup";
import { ProfileAvatar } from "./wallet/ProfileAvatar";
import { Settings } from "./wallet/Settings";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async (address: string) => {
    try {
      // @ts-ignore
      const { solana } = window;
      if (!solana?.isPhantom) return;

      const connection = new Connection(
        "https://api.mainnet-beta.solana.com",
        "confirmed"
      );
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      console.log("Fetched balance:", balance / LAMPORTS_PER_SOL); // Debug log
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
  };

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
    try {
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
        toast.error("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
        return;
      }

      const response = await solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      setWalletAddress(address);
      setConnected(true);
      
      // Fetch balance immediately after connection
      await fetchBalance(address);
      console.log("Connected with address:", address); // Debug log

      toast.success("Wallet connected!");
      await loadProfile(address);

      localStorage.setItem("phantomConnected", "true");
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("[WalletConnect] Error connecting wallet:", error);
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
        setBalance(null);

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
      // @ts-ignore
      const { solana } = window;

      const wasConnected = localStorage.getItem("phantomConnected") === "true";
      const savedWalletAddress = localStorage.getItem("walletAddress");
      const savedProfile = localStorage.getItem("userProfile");

      if (wasConnected && solana?.isPhantom && savedWalletAddress) {
        try {
          const response = await solana.connect({ onlyIfTrusted: true });
          const address = response.publicKey.toString();
          setWalletAddress(address);
          setConnected(true);
          await fetchBalance(address);
          console.log("Reconnected with address:", address); // Debug log

          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            setDisplayName(parsedProfile.displayName || null);
            setAvatarUrl(parsedProfile.avatarUrl || null);
          } else {
            await loadProfile(address);
          }

          toast.success("Reconnected to wallet!");
        } catch (error) {
          console.error("[WalletConnect] Error reconnecting:", error);
          localStorage.removeItem("phantomConnected");
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("userProfile");
        }
      }
    };

    initializeWallet();

    // Set up balance refresh interval
    const balanceInterval = setInterval(() => {
      if (walletAddress) {
        fetchBalance(walletAddress);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(balanceInterval);
  }, [walletAddress]);

  return (
    <>
      {connected ? (
        <div className="fixed top-4 right-4 flex items-center gap-4">
          {balance !== null && (
            <div className="text-purple-500 font-medium text-lg">
              {balance.toFixed(2)} SOL
            </div>
          )}
          <div className="flex items-center gap-2">
            <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
            <span className="text-white">{displayName || "Unknown User"}</span>
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