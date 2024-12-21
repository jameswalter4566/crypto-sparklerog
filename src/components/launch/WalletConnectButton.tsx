import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGlobalWallet } from "../WalletProvider";

interface WalletConnectButtonProps {
  isSubmitting: boolean;
  hasEnoughBalance: boolean;
  onWalletConnected: () => void;
}

export const WalletConnectButton = ({
  isSubmitting,
  hasEnoughBalance,
  onWalletConnected,
}: WalletConnectButtonProps) => {
  const { connect, disconnect } = useWallet();
  const { connected, walletAvailable, connectionAttempts } = useGlobalWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  useEffect(() => {
    // Reset connecting state when connection status changes
    if (connected) {
      setIsConnecting(false);
    }
  }, [connected]);

  const handleRetry = async () => {
    if (connectionAttempts >= MAX_RETRIES) {
      toast.error("Maximum connection attempts reached", {
        description: "Please refresh the page and try again.",
      });
      return;
    }
    
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    handleConnect();
  };

  const handleConnect = async () => {
    console.log("[WalletConnectButton] Handle connect triggered", {
      walletAvailable,
      connected,
      isConnecting,
      connectionAttempts,
    });

    // Check if Phantom is installed
    // @ts-ignore
    const phantom = window?.solana;
    if (!phantom?.isPhantom) {
      toast.error("Phantom wallet not found", {
        description: "Please install Phantom to continue",
        action: {
          label: "Install",
          onClick: () => window.open("https://phantom.app/", "_blank"),
        },
      });
      return;
    }

    if (isConnecting) {
      console.log("[WalletConnectButton] Connection already in progress");
      return;
    }

    try {
      setIsConnecting(true);

      // Disconnect existing sessions
      if (connected) {
        await disconnect();
        console.log("[WalletConnectButton] Disconnected existing session");
      }

      // Force Phantom to disconnect
      try {
        await phantom.disconnect();
        console.log("[WalletConnectButton] Disconnected Phantom session");
      } catch (disconnectError) {
        console.log("[WalletConnectButton] Phantom disconnect error (non-critical):", disconnectError);
      }

      // Ensure clean state before connecting
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const response = await phantom.connect({ onlyIfTrusted: false });
        console.log("[WalletConnectButton] Connected to Phantom:", response);

        await connect();
        console.log("[WalletConnectButton] Wallet adapter connection successful");
        
        onWalletConnected();
        toast.success("Wallet connected successfully!");
      } catch (connectError) {
        console.error("[WalletConnectButton] Wallet connection failed:", connectError);
        
        if (connectError.name === "WalletNotSelectedError") {
          if (connectionAttempts < MAX_RETRIES) {
            toast.error("Connection canceled", {
              description: "Automatically retrying in 1 second...",
            });
            setTimeout(() => handleRetry(), RETRY_DELAY);
          } else {
            toast.error("Connection canceled", {
              description: "Maximum retries reached. Please try again later.",
            });
          }
        } else {
          toast.error("Failed to connect wallet", {
            description: connectError.message,
            action: {
              label: "Try Again",
              onClick: () => handleRetry(),
            },
          });
        }
      }
    } catch (error: any) {
      console.error("[WalletConnectButton] Connection error:", error);
      toast.error("Unexpected error occurred", { 
        description: error.message,
        action: {
          label: "Try Again",
          onClick: () => handleRetry(),
        },
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const buttonDisabled = isSubmitting || isConnecting || (connected && !hasEnoughBalance);

  const buttonText = !connected
    ? isConnecting
      ? `Connecting${connectionAttempts > 0 ? ` (Attempt ${connectionAttempts}/${MAX_RETRIES})` : ''}...`
      : "Connect Wallet to Create"
    : !hasEnoughBalance
    ? "Insufficient SOL Balance"
    : isSubmitting
    ? "Creating coin..."
    : "Create coin";

  return (
    <Button
      type="button"
      className="w-full"
      disabled={buttonDisabled}
      onClick={handleConnect}
    >
      {buttonText}
    </Button>
  );
};