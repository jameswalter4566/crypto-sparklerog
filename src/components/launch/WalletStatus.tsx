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

  const fetchSolBalance = async () => {
    if (publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / 1e9;
        setSolBalance(solBalance);
        onBalanceChange(solBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      console.log("Wallet connected:", publicKey.toString());
      fetchSolBalance();
    } else {
      console.log("Wallet not connected");
      setSolBalance(0);
      onBalanceChange(0);
    }
  }, [connected, publicKey]);

  if (!connected) return null;

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