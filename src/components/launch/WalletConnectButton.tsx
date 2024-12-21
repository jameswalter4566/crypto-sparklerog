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

  const handleConnect = async () => {
    console.log('[WalletConnectButton] Handle connect triggered', {
      walletAvailable,
      connected,
      connecting,
      isDebouncing
    });

    // @ts-ignore
    const phantom = window?.solana;

    if (!phantom?.isPhantom) {
      console.log('[WalletConnectButton] Phantom wallet not installed');
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

    try {
      console.log('[WalletConnectButton] Initiating connection...');
      setIsDebouncing(true);
      
      // Try to connect directly to Phantom
      const response = await phantom.connect();
      console.log('[WalletConnectButton] Phantom connection successful:', response.publicKey.toString());
      
      // Now trigger the wallet adapter connection
      await connect();
      console.log('[WalletConnectButton] Wallet adapter connected');
      onWalletConnected();
    } catch (error) {
      console.error('[WalletConnectButton] Connection error:', error);
      // Only show error if it's not a user cancellation
      if (error instanceof Error && error.name !== "WalletNotSelectedError") {
        toast.error("Failed to connect wallet", {
          description: error.message
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