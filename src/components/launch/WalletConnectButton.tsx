import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const { connect, connecting, connected, wallet, publicKey } = useWallet();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for wallet availability on mount
  useEffect(() => {
    const checkWallet = () => {
      const phantom = (window as any).solana;
      console.log('[WalletConnectButton] Checking wallet availability:', {
        phantomExists: !!phantom,
        isPhantom: phantom?.isPhantom,
        timestamp: new Date().toISOString()
      });

      if (!phantom?.isPhantom) {
        toast.error("Phantom wallet not found", {
          description: "Please install Phantom to continue",
          action: {
            label: "Install",
            onClick: () => window.open("https://phantom.app/", "_blank")
          }
        });
      }
    };

    checkWallet();
    setIsInitializing(false);
  }, []);

  // Handle existing connections
  useEffect(() => {
    if (connected && publicKey) {
      console.log('[WalletConnectButton] Using existing connection:', {
        wallet: wallet?.adapter.name,
        publicKey: publicKey.toBase58(),
        timestamp: new Date().toISOString()
      });
      onWalletConnected();
    }
  }, [connected, publicKey, wallet, onWalletConnected]);

  const handleConnect = async () => {
    if (connecting || isInitializing) return;

    if (connected && publicKey) {
      console.log('[WalletConnectButton] Already connected:', {
        wallet: wallet?.adapter.name,
        publicKey: publicKey.toBase58(),
        timestamp: new Date().toISOString()
      });
      onWalletConnected();
      return;
    }

    try {
      console.log('[WalletConnectButton] Initiating connection...');
      await connect();
    } catch (error) {
      console.error('[WalletConnectButton] Connection error:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      // Don't show error for user cancellation
      if (error instanceof Error && error.name !== "WalletNotSelectedError") {
        toast.error("Failed to connect wallet", {
          description: error.message
        });
      }
    }
  };

  const buttonDisabled = isInitializing || connecting || (connected && (!hasEnoughBalance || isSubmitting));
  const buttonText = !connected 
    ? connecting 
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