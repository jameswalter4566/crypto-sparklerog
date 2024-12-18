import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
        disconnect: () => Promise<void>;
      };
    };
  }
}

export const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      const { solana } = window?.phantom ?? {};

      if (!solana?.isPhantom) {
        toast({
          variant: "destructive",
          title: "Phantom wallet not found",
          description: "Please install Phantom wallet extension",
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      toast({
        title: "Wallet connected",
        description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Failed to connect to Phantom wallet",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      const { solana } = window?.phantom ?? {};
      if (solana) {
        await solana.disconnect();
        setWalletAddress('');
        toast({
          title: "Wallet disconnected",
          description: "Successfully disconnected from Phantom wallet",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Disconnection failed",
        description: "Failed to disconnect from Phantom wallet",
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {!walletAddress ? (
        <Button 
          onClick={connectWallet}
          className="bg-primary hover:bg-primary/90"
        >
          Connect Phantom
        </Button>
      ) : (
        <Button 
          onClick={disconnectWallet}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
        </Button>
      )}
    </div>
  );
};