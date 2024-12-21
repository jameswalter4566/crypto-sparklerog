import { useEffect, useState, useCallback } from "react";
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
  const RETRY_DELAY = 2000; // 2 seconds

  // Reset retry count on successful connection
  useEffect(() => {
    if (connected && publicKey) {
      setRetryCount(0);
    }
  }, [connected, publicKey]);

  // Implement delayed retry mechanism
  useEffect(() => {
    if (retryCount > 0 && retryCount < MAX_RETRIES && !connected) {
      const retryTimeout = setTimeout(() => {
        console.log('[WalletConnectButton] Retrying connection...', {
          attempt: retryCount,
          timestamp: new Date().toISOString()
        });
        connect();
      }, RETRY_DELAY);

      return () => clearTimeout(retryTimeout);
    }
  }, [retryCount, connected, connect]);

  const handleConnect = useCallback(async () => {
    if (connecting) return;

    try {
      console.log('[WalletConnectButton] Initiating connection...', {
        retryCount,
        timestamp: new Date().toISOString()
      });

      await connect();
      
      if (connected && publicKey) {
        console.log('[WalletConnectButton] Connection successful', {
          address: publicKey.toBase58(),
          wallet: wallet?.adapter.name,
          timestamp: new Date().toISOString()
        });
        onWalletConnected();
      }
    } catch (error) {
      console.error('[WalletConnectButton] Connection error:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        retryCount,
        timestamp: new Date().toISOString()
      });

      if (error instanceof Error) {
        if (error.name === "WalletNotSelectedError") {
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            toast.error("Wallet connection cancelled", {
              description: `Retrying in ${RETRY_DELAY/1000} seconds...`
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
      }
    }
  }, [connecting, connect, connected, publicKey, wallet, retryCount, onWalletConnected]);

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