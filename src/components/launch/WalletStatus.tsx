import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";

interface WalletStatusProps {
  onBalanceChange: (balance: number) => void;
}

export const WalletStatus = ({ onBalanceChange }: WalletStatusProps) => {
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const fetchSolBalance = async () => {
    if (!publicKey) {
      console.log('[WalletStatus] Cannot fetch balance - no public key available', {
        timestamp: new Date().toISOString()
      });
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < 2000) { // Prevent fetches within 2 seconds
      console.log('[WalletStatus] Skipping balance fetch - too soon', {
        timeSinceLastFetch: now - lastFetchRef.current,
        timestamp: new Date().toISOString()
      });
      return;
    }

    setIsLoading(true);
    lastFetchRef.current = now;

    try {
      console.log('[WalletStatus] Fetching balance...', {
        wallet: publicKey.toBase58(),
        timestamp: new Date().toISOString()
      });

      const balance = await connection.getBalance(publicKey);
      const solBalanceValue = balance / 1e9;
      
      console.log('[WalletStatus] Balance fetched successfully', {
        wallet: publicKey.toBase58(),
        balance: solBalanceValue,
        timestamp: new Date().toISOString()
      });

      setSolBalance(solBalanceValue);
      onBalanceChange(solBalanceValue);
    } catch (error) {
      console.error('[WalletStatus] Error fetching balance', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        wallet: publicKey.toBase58(),
        timestamp: new Date().toISOString()
      });
      
      if (solBalance !== 0) {
        setSolBalance(0);
        onBalanceChange(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchSolBalance();
    } else if (!connected || !publicKey) {
      if (solBalance !== 0) {
        setSolBalance(0);
        onBalanceChange(0);
      }
    }
  }, [connected, publicKey]);

  if (!connected || !publicKey) return null;

  return (
    <div className="bg-secondary/20 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">
            Wallet: {publicKey.toBase58().slice(0, 8)}...
          </span>
          <span className="text-xs text-muted-foreground">
            {wallet?.adapter.name || 'Unknown Wallet'}
          </span>
        </div>
        <span className="text-sm font-medium">
          {isLoading ? 'Loading...' : `${solBalance.toFixed(4)} SOL`}
        </span>
      </div>
    </div>
  );
};