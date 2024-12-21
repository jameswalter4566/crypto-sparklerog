import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";
import { useGlobalWallet } from "../WalletProvider";

interface WalletStatusProps {
  onBalanceChange: (balance: number) => void;
}

const BALANCE_POLLING_INTERVAL = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const WalletStatus = ({ onBalanceChange }: WalletStatusProps) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { connected, selectedWallet } = useGlobalWallet();
  const [solBalance, setSolBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const retryCountRef = useRef(0);
  const pollingIntervalRef = useRef<number>();

  const fetchSolBalance = async (retryCount = 0) => {
    if (!publicKey || !connected) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WalletStatus] Cannot fetch balance - no connection', {
          timestamp: new Date().toISOString()
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WalletStatus] Fetching balance...', {
          wallet: publicKey.toBase58(),
          timestamp: new Date().toISOString()
        });
      }

      const balance = await connection.getBalance(publicKey);
      const solBalanceValue = balance / 1e9;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[WalletStatus] Balance fetched successfully', {
          wallet: publicKey.toBase58(),
          balance: solBalanceValue,
          timestamp: new Date().toISOString()
        });
      }

      setSolBalance(solBalanceValue);
      onBalanceChange(solBalanceValue);
      setIsLoading(false);
      retryCountRef.current = 0;
    } catch (error) {
      console.error('[WalletStatus] Error fetching balance', {
        error,
        retryCount,
        wallet: publicKey.toBase58(),
        timestamp: new Date().toISOString()
      });
      
      // Retry up to MAX_RETRIES times with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(RETRY_DELAY * Math.pow(2, retryCount), 10000);
        setTimeout(() => fetchSolBalance(retryCount + 1), delay);
      } else {
        setIsLoading(false);
        setSolBalance(0);
        onBalanceChange(0);
      }
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchSolBalance();
      // Start polling
      pollingIntervalRef.current = window.setInterval(fetchSolBalance, BALANCE_POLLING_INTERVAL);
    } else {
      setSolBalance(0);
      onBalanceChange(0);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
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
            {selectedWallet || 'Unknown Wallet'}
          </span>
        </div>
        <span className="text-sm font-medium">
          {isLoading ? 'Loading...' : `${solBalance.toFixed(4)} SOL`}
        </span>
      </div>
    </div>
  );
};