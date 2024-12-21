import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider 
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // You can also provide the network as a prop if you want to make it configurable
  const network = WalletAdapterNetwork.Devnet;

  // Generate the endpoint URL based on the selected network
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize the wallet adapter
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}