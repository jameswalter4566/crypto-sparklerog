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
  const { connect, connecting } = useWallet();
  const { connected, walletAvailable } = useGlobalWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    console.log("[WalletConnectButton] Handle connect triggered", {
      walletAvailable,
      connected,
      connecting,
      isConnecting,
    });

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

    if (connected) {
      console.log("[WalletConnectButton] Already connected");
      onWalletConnected();
      return;
    }

    // Prevent multiple connection attempts
    if (isConnecting || connecting) {
      console.log("[WalletConnectButton] Connection already in progress");
      return;
    }

    try {
      setIsConnecting(true);
      console.log("[WalletConnectButton] Initiating connection...");

      // Try to connect directly to Phantom first
      try {
        // Force a new connection attempt by disconnecting first
        await phantom.disconnect();
        console.log("[WalletConnectButton] Disconnected existing session");
        
        // Small delay to ensure disconnect completes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Connect with a fresh session
        const response = await phantom.connect();
        console.log("[WalletConnectButton] Connected to Phantom:", response);
        onWalletConnected();
      } catch (phantomError) {
        console.log("[WalletConnectButton] Phantom direct connection failed:", phantomError);
        // If direct connection fails, try wallet adapter as fallback
        await connect();
        onWalletConnected();
      }
    } catch (error) {
      console.error("[WalletConnectButton] Connection error:", error);
      
      // Only show error toast if it's not a user cancellation
      if (error instanceof Error && error.name !== "WalletNotSelectedError") {
        toast.error("Failed to connect wallet", {
          description: error.message,
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const buttonDisabled = isSubmitting || connecting || isConnecting || (connected && !hasEnoughBalance);

  const buttonText = !connected
    ? connecting || isConnecting
      ? "Connecting..."
      : "Connect Wallet to Create"
    : !hasEnoughBalance
    ? "Insufficient SOL Balance"
    : isSubmitting
    ? "Creating coin..."
    : "Create coin";

  console.log("[WalletConnectButton] Button State:", {
    buttonDisabled,
    buttonText,
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