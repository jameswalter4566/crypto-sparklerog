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

const WalletConnectionMonitor = ({ children }: { children: React.ReactNode }) => {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();
  
  useEffect(() => {
    console.log('WalletProvider: Connection state changed:', {
      connected,
      connecting,
      disconnecting,
      publicKey: publicKey?.toBase58(),
      selectedWallet: wallet?.adapter.name,
      timestamp: new Date().toISOString()
    });
  }, [connected, connecting, disconnecting, publicKey, wallet]);

  return <>{children}</>;
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  console.log('WalletProvider: Initializing...', { timestamp: new Date().toISOString() });

  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    const url = clusterApiUrl(network);
    console.log('WalletProvider: Solana endpoint configured:', {
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
    console.log('WalletProvider: Wallet adapters initialized:', {
      adapters: adapters.map(a => a.name),
      timestamp: new Date().toISOString()
    });
    return adapters;
  }, []);

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletConnectionMonitor>
            {children}
          </WalletConnectionMonitor>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}