import React, { useMemo, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  console.log('Initializing WalletProvider...');

  // Use Devnet for development
  const network = WalletAdapterNetwork.Devnet;

  // Generate the endpoint URL based on the selected network
  const endpoint = useMemo(() => {
    const url = clusterApiUrl(network);
    console.log('Solana endpoint:', url);
    return url;
  }, [network]);

  // Initialize wallet adapters
  const wallets = useMemo(() => {
    const adapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
    console.log('WalletProvider: Initialized wallets:', adapters);
    return adapters;
  }, []);

  useEffect(() => {
    console.log('WalletProvider: Component mounted with wallets:', wallets);
  }, [wallets]);

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          {children}
        </SolanaWalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}