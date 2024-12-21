import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGlobalWallet } from "../WalletProvider";
import { debounce } from "lodash";

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

  const debouncedConnect = debounce(async () => {
    try {
      console.log('[WalletConnectButton] Initiating connection...');
      setIsDebouncing(true);
      await connect();
      console.log('[WalletConnectButton] Connection successful');
      onWalletConnected();
    } catch (error) {
      console.error('[WalletConnectButton] Connection error:', error);
      // Don't show error for user cancellation
      if (error instanceof Error && error.name !== "WalletNotSelectedError") {
        toast.error("Failed to connect wallet", {
          description: error.message
        });
      }
    } finally {
      setIsDebouncing(false);
    }
  }, 500);

  useEffect(() => {
    // Cleanup debounce on unmount
    return () => {
      debouncedConnect.cancel();
    };
  }, []);

  const handleConnect = async () => {
    console.log('[WalletConnectButton] Handle connect triggered', {
      walletAvailable,
      connected,
      connecting,
      isDebouncing
    });

    if (!walletAvailable) {
      console.log('[WalletConnectButton] Wallet not available');
      toast.error("Phantom wallet not found", {
        description: "Please install Phantom to continue",
        action: {
          label: "Install",
          onClick: () => window.open("https://phantom.app/", "_blank")
        }
      });
      return;
    }

    if (connected) {
      console.log('[WalletConnectButton] Already connected, proceeding...');
      onWalletConnected();
      return;
    }

    console.log('[WalletConnectButton] Initiating connection...');
    debouncedConnect();
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