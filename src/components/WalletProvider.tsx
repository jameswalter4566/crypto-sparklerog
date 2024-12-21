import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
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

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider autoConnect>
          {children}
        </SolanaWalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}