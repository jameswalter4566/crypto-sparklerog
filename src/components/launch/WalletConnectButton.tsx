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
  const { connect, connecting, connected } = useWallet();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Enhanced wallet detection check
  useEffect(() => {
    // @ts-ignore
    const phantom = window.solana;
    console.log("WalletConnectButton: Detected wallet", {
      phantomExists: !!phantom,
      isPhantom: phantom?.isPhantom,
      timestamp: new Date().toISOString()
    });

    if (!phantom || !phantom.isPhantom) {
      console.warn(
        "WalletConnectButton: Phantom wallet not detected. Please install it.",
        { timestamp: new Date().toISOString() }
      );
    }
  }, []);

  const handleConnect = async () => {
    try {
      // @ts-ignore
      const { solana } = window;

      // Enhanced wallet detection check with user feedback
      if (!solana) {
        console.error("WalletConnectButton: No wallet detected in window.solana", {
          timestamp: new Date().toISOString()
        });
        toast.error("No wallet detected", {
          description: "Please install Phantom wallet to continue",
          action: {
            label: "Install",
            onClick: () => window.open("https://phantom.app/", "_blank")
          }
        });
        return;
      }

      if (!solana.isPhantom) {
        console.error("WalletConnectButton: Non-Phantom wallet detected", {
          walletType: solana.constructor.name,
          timestamp: new Date().toISOString()
        });
        toast.error("Please install Phantom wallet", {
          description: "This app requires Phantom wallet",
          action: {
            label: "Install",
            onClick: () => window.open("https://phantom.app/", "_blank")
          }
        });
        return;
      }

      console.log('WalletConnectButton: Initiating connection...', {
        retryCount,
        timestamp: new Date().toISOString()
      });

      await connect();
      
      console.log('WalletConnectButton: Connection successful', {
        timestamp: new Date().toISOString()
      });
      
      setRetryCount(0); // Reset retry count on success
      onWalletConnected();
    } catch (error) {
      console.error('WalletConnectButton: Connection error:', {
        error,
        retryCount,
        timestamp: new Date().toISOString()
      });

      // Handle different error types
      if (error instanceof Error) {
        if (error.name === "WalletNotSelectedError") {
          if (retryCount < MAX_RETRIES) {
            console.log("WalletConnectButton: Retrying connection...", {
              attempt: retryCount + 1,
              timestamp: new Date().toISOString()
            });
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

  // Button states with improved feedback
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