import { useState } from "react";
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
  const { connect, disconnect, connecting } = useWallet();
  const { connected, walletAvailable } = useGlobalWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const MAX_RETRIES = 3;

  const handleConnect = async () => {
    console.log("[WalletConnectButton] Handle connect triggered", {
      walletAvailable,
      connected,
      connecting,
      isConnecting,
      retryAttempt,
    });

    // Check if max retries reached
    if (retryAttempt >= MAX_RETRIES) {
      toast.error("Maximum connection attempts reached", {
        description: "Please refresh the page and try again.",
      });
      return;
    }

    // Check if Phantom is installed
    // @ts-ignore
    const phantom = window?.solana;
    if (!phantom?.isPhantom) {
      console.log("[WalletConnectButton] Phantom wallet not installed");
      toast.error("Phantom wallet not found", {
        description: "Please install Phantom to continue",
        action: {
          label: "Install",
          onClick: () => window.open("https://phantom.app/", "_blank"),
        },
      });
      return;
    }

    // Prevent multiple connection attempts
    if (isConnecting || connecting) {
      console.log("[WalletConnectButton] Connection already in progress");
      return;
    }

    try {
      setIsConnecting(true);
      console.log("[WalletConnectButton] Initiating connection attempt:", retryAttempt + 1);

      // Disconnect any existing sessions
      if (connected) {
        await disconnect();
        console.log("[WalletConnectButton] Disconnected existing wallet adapter session");
      }

      // Force Phantom to disconnect
      try {
        await phantom.disconnect();
        console.log("[WalletConnectButton] Disconnected Phantom session");
      } catch (disconnectError) {
        console.log("[WalletConnectButton] Phantom disconnect error (non-critical):", disconnectError);
      }

      // Increased delay to ensure disconnect completes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Establish a fresh connection
      try {
        const response = await phantom.connect({ onlyIfTrusted: false });
        console.log("[WalletConnectButton] Connected to Phantom:", response);

        // Wallet adapter connection
        await connect();
        console.log("[WalletConnectButton] Wallet adapter connection successful");
        
        setRetryAttempt(0); // Reset retry counter on success
        onWalletConnected();
        toast.success("Wallet connected successfully!");
      } catch (connectError) {
        console.error("[WalletConnectButton] Wallet connection failed:", connectError);
        
        if (connectError.name === "WalletNotSelectedError") {
          setRetryAttempt(prev => prev + 1);
          toast.error("Connection canceled", {
            description: "Please try connecting again.",
            action: {
              label: "Retry",
              onClick: () => handleConnect(),
            },
          });
        } else {
          toast.error("Failed to connect wallet", {
            description: connectError.message,
            action: {
              label: "Try Again",
              onClick: () => handleConnect(),
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
          onClick: () => handleConnect(),
        },
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const buttonDisabled = isSubmitting || connecting || isConnecting || (connected && !hasEnoughBalance);

  const buttonText = !connected
    ? connecting || isConnecting
      ? `Connecting${retryAttempt > 0 ? ` (Attempt ${retryAttempt + 1}/${MAX_RETRIES})` : ''}...`
      : "Connect Wallet to Create"
    : !hasEnoughBalance
    ? "Insufficient SOL Balance"
    : isSubmitting
    ? "Creating coin..."
    : "Create coin";

  console.log("[WalletConnectButton] Button State:", { 
    buttonDisabled, 
    buttonText,
    retryAttempt 
  });

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