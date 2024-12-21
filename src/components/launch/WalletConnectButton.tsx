import { useEffect } from "react";
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

  // Check for Phantom wallet availability
  useEffect(() => {
    // @ts-ignore
    const phantom = window.solana;
    if (phantom?.isPhantom) {
      console.log('WalletConnectButton: Phantom wallet detected');
    } else {
      console.log('WalletConnectButton: Phantom wallet not detected');
    }
  }, []);

  const handleConnect = async () => {
    try {
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
        toast.error("Please install Phantom wallet", {
          action: {
            label: "Install",
            onClick: () => window.open("https://phantom.app/", "_blank")
          }
        });
        return;
      }

      console.log('WalletConnectButton: Initiating connection...');
      await connect();
      console.log('WalletConnectButton: Connection successful');
      onWalletConnected();
    } catch (error) {
      console.error('WalletConnectButton: Connection error:', error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  // Button is only disabled if wallet is connected but has insufficient balance or is submitting
  const buttonDisabled = connected && (!hasEnoughBalance || isSubmitting);
  const buttonText = !connected 
    ? connecting ? "Connecting..." : "Connect Wallet to Create"
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
      onClick={connected ? onWalletConnected : handleConnect}
    >
      {buttonText}
    </Button>
  );
};