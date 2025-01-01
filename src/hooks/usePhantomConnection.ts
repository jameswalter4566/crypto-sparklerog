import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePhantomMobile } from "./usePhantomMobile";

export const usePhantomConnection = (onProfileLoad: (address: string) => Promise<void>) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { isMobileDevice, openPhantomApp } = usePhantomMobile();
  
  const handleSuccessfulConnection = async (address: string) => {
    console.log("Handling successful connection for address:", address);
    localStorage.setItem("phantomConnected", "true");
    localStorage.setItem("walletAddress", address);
    await onProfileLoad(address);
    toast.success("Wallet connected!");
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    try {
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
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

      const response = await solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      await handleSuccessfulConnection(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // @ts-ignore
      const { solana } = window;
      if (solana) {
        await solana.disconnect();
        localStorage.removeItem("phantomConnected");
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("userProfile");
        toast.success("Wallet disconnected!");
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Error disconnecting wallet");
    }
  };

  useEffect(() => {
    const checkConnectionStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const phantomAddress = urlParams.get("phantom_wallet_address");
      
      if (phantomAddress) {
        await handleSuccessfulConnection(phantomAddress);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkConnectionStatus();
  }, []);

  return {
    isConnecting,
    connectWallet,
    disconnectWallet
  };
};