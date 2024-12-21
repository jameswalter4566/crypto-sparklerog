import React, { useMemo, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { toast } from "sonner";

// Monitor component to handle global wallet state changes
const WalletConnectionMonitor = ({ children }: { children: React.ReactNode }) => {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();
  
  useEffect(() => {
    console.log('[WalletProvider] Connection state changed:', {
      connected,
      connecting,
      disconnecting,
      publicKey: publicKey?.toBase58(),
      selectedWallet: wallet?.adapter.name,
      timestamp: new Date().toISOString()
    });

    if (connected && publicKey) {
      toast.success(`Connected to ${wallet?.adapter.name || 'wallet'}`);
    }
    if (disconnecting) {
      toast.info("Disconnecting wallet...");
    }
    if (connecting) {
      toast.info("Connecting wallet...");
    }
  }, [connected, connecting, disconnecting, publicKey, wallet]);

  return <>{children}</>;
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = (process.env.VITE_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    const url = clusterApiUrl(network);
    console.log('[WalletProvider] Solana endpoint configured:', {
      network,
      url,
      timestamp: new Date().toISOString()
    });
    return url;
  }, [network]);

  const wallets = useMemo(() => {
    const adapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
    console.log('[WalletProvider] Wallet adapters initialized:', {
      adapters: adapters.map(a => a.name),
      timestamp: new Date().toISOString()
    });
    return adapters;
  }, []);

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider 
          wallets={wallets} 
          autoConnect
          onError={(error) => {
            console.error('[WalletProvider] Error:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
              timestamp: new Date().toISOString()
            });
            
            if (error.name === "WalletNotSelectedError") {
              toast.error("Wallet connection cancelled", {
                description: "Please select a wallet to continue"
              });
            } else {
              toast.error("Wallet error", {
                description: error.message
              });
            }
          }}
        >
          <WalletConnectionMonitor>
            {children}
          </WalletConnectionMonitor>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}