import { useState, useEffect } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

const HELIUS_RPC = 'https://rpc.helius.xyz/?api-key=726140d8-6b0d-4719-8702-682d81e94a37';

export const useWalletConnection = (onProfileLoad: (address: string) => Promise<void>) => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async (address: string) => {
    try {
      // @ts-ignore
      const { solana } = window;
      if (!solana?.isPhantom) return;

      const connection = new Connection(HELIUS_RPC, "confirmed");
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      console.log("Fetched balance:", balance / LAMPORTS_PER_SOL);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
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
      
      await fetchBalance(address);
      console.log("Connected with address:", address);

      toast.success("Wallet connected!");
      await onProfileLoad(address);

      localStorage.setItem("phantomConnected", "true");
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("[useWalletConnection] Error connecting wallet:", error);
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
        setBalance(null);

        localStorage.removeItem("phantomConnected");
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("userProfile");

        toast.success("Wallet disconnected!");
      }
    } catch (error) {
      console.error("[useWalletConnection] Error disconnecting wallet:", error);
      toast.error("Error disconnecting wallet");
    }
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
          console.log("Reconnected with address:", address);

          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            await onProfileLoad(address);
          } else {
            await onProfileLoad(address);
          }

          toast.success("Reconnected to wallet!");
        } catch (error) {
          console.error("[useWalletConnection] Error reconnecting:", error);
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
  }, [onProfileLoad]);

  return {
    connected,
    walletAddress,
    balance,
    connectWallet,
    disconnectWallet
  };
};