import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";

interface WalletStatusProps {
  onBalanceChange: (balance: number) => void;
}

export const WalletStatus = ({ onBalanceChange }: WalletStatusProps) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState(0);

  // Add logging for component mount
  useEffect(() => {
    console.log('WalletStatus: Component mounted');
    console.log('WalletStatus: Initial state:', {
      connected,
      publicKey: publicKey?.toBase58(),
      solBalance
    });
  }, []);

  const fetchSolBalance = async () => {
    if (publicKey) {
      try {
        console.log('WalletStatus: Fetching balance for wallet:', publicKey.toBase58());
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / 1e9;
        console.log('WalletStatus: Balance fetched:', solBalance);
        setSolBalance(solBalance);
        onBalanceChange(solBalance);
      } catch (error) {
        console.error("WalletStatus: Error fetching balance:", error);
        setSolBalance(0);
        onBalanceChange(0);
      }
    }
  };

  // Add logging for connection state changes
  useEffect(() => {
    console.log('WalletStatus: Connection state changed:', {
      connected,
      publicKey: publicKey?.toBase58(),
      hasPublicKey: !!publicKey
    });

    if (connected && publicKey) {
      console.log('WalletStatus: Initiating balance fetch');
      fetchSolBalance();
    } else {
      console.log('WalletStatus: Resetting balance - wallet disconnected or no public key');
      setSolBalance(0);
      onBalanceChange(0);
    }
  }, [connected, publicKey]);

  // Add logging for balance changes
  useEffect(() => {
    console.log('WalletStatus: Balance state updated:', solBalance);
  }, [solBalance]);

  if (!connected) {
    console.log('WalletStatus: Not rendering - wallet not connected');
    return null;
  }

  return (
    <div className="bg-secondary/20 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Wallet: {publicKey?.toBase58().slice(0, 8)}...
        </span>
        <span className="text-sm font-medium">{solBalance.toFixed(4)} SOL</span>
      </div>
    </div>
  );
};