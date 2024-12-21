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

    // Prevent multiple connection attempts
    if (isConnecting || connecting) {
      console.log("[WalletConnectButton] Connection already in progress");
      return;
    }

    try {
      setIsConnecting(true);
      console.log("[WalletConnectButton] Initiating connection...");

      // First, disconnect any existing sessions
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

      // Small delay to ensure disconnect completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now try to establish a fresh connection
      try {
        const response = await phantom.connect({ onlyIfTrusted: false });
        console.log("[WalletConnectButton] Connected to Phantom:", response);
        
        // Now connect with wallet adapter
        await connect();
        console.log("[WalletConnectButton] Wallet adapter connection successful");
        
        onWalletConnected();
        toast.success("Wallet connected successfully!");
      } catch (connectError) {
        console.error("[WalletConnectButton] Connection failed:", connectError);
        throw connectError; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error("[WalletConnectButton] Connection error:", error);
      
      // Only show error toast if it's not a user cancellation
      if (error instanceof Error && 
          error.name !== "WalletNotSelectedError" && 
          error.name !== "WalletConnectionError") {
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