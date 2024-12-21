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

  const handleConnect = async () => {
    if (!walletAvailable) {
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
    }
  };

  const buttonDisabled = isSubmitting || connecting || (connected && !hasEnoughBalance);
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