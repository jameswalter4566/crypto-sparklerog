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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (connected && publicKey) {
      console.log("WalletConnectButton: Wallet connected", {
        address: publicKey.toBase58(),
        wallet: wallet?.adapter.name,
        timestamp: new Date().toISOString()
      });
      onWalletConnected();
    }
  }, [connected, publicKey, wallet, onWalletConnected]);

  const handleConnect = async () => {
    try {
      if (connecting) return;

      console.log('WalletConnectButton: Initiating connection...', {
        retryCount,
        timestamp: new Date().toISOString()
      });

      await connect();
    } catch (error) {
      console.error('WalletConnectButton: Connection error:', {
        error,
        retryCount,
        timestamp: new Date().toISOString()
      });

      if (error instanceof Error) {
        if (error.name === "WalletNotSelectedError") {
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            toast.error("Wallet connection cancelled", {
              description: "Please try connecting again"
            });
          } else {
            toast.error("Multiple connection attempts failed", {
              description: "Please refresh the page and try again"
            });
            setRetryCount(0);
          }
        } else {
          toast.error("Failed to connect wallet", {
            description: error.message
          });
        }
      } else {
        toast.error("Unexpected error occurred", {
          description: "Please try again or refresh the page"
        });
      }
    }
  };

  const buttonDisabled = connected && (!hasEnoughBalance || isSubmitting);
  const buttonText = !connected 
    ? connecting 
      ? `Connecting${".".repeat(retryCount + 1)}` 
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
      disabled={buttonDisabled || connecting}
      onClick={connected ? onWalletConnected : handleConnect}
    >
      {buttonText}
    </Button>
  );
};