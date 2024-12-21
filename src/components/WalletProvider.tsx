import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider 
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { ErrorBoundary } from "./ErrorBoundary";

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

  // Initialize the wallet adapter with Phantom
  const wallets = useMemo(() => {
    console.log('Initializing wallet adapters...');
    return [new PhantomWalletAdapter()];
  }, []);

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