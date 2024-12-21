import { useEffect, useState } from "react";
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
  onWalletConnected 
}: WalletConnectButtonProps) => {
  const { connect, connecting } = useWallet();
  const { connected, walletAvailable } = useGlobalWallet();
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleConnect = async () => {
    console.log('[WalletConnectButton] Handle connect triggered', {
      walletAvailable,
      connected,
      connecting,
      isDebouncing,
    });

    if (!walletAvailable) {
      console.log('[WalletConnectButton] Phantom wallet not detected');
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
      console.log('[WalletConnectButton] Already connected');
      onWalletConnected();
      return;
    }

    try {
      console.log('[WalletConnectButton] Initiating connection...');
      setIsDebouncing(true);

      // Connect via wallet adapter
      await connect();
      console.log('[WalletConnectButton] Wallet connected successfully');
      onWalletConnected();
    } catch (error) {
      console.error('[WalletConnectButton] Connection error:', error);

      if (error instanceof Error) {
        // Handle user rejection gracefully
        if (error.name === "WalletNotSelectedError") {
          toast.error("Connection cancelled", {
            description: "Please select your wallet to proceed",
          });
        } else {
          toast.error("Failed to connect wallet", {
            description: error.message,
          });
        }
      } else {
        toast.error("Unexpected error occurred", {
          description: "Please try again",
        });
      }
    } finally {
      setIsDebouncing(false);
    }
  };

  const buttonDisabled = isSubmitting || connecting || isDebouncing || (connected && !hasEnoughBalance);

  const buttonText = !connected 
    ? connecting || isDebouncing
      ? "Connecting..." 
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
