import React, { useMemo, useEffect, createContext, useContext } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { ErrorBoundary } from "./ErrorBoundary";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { toast } from "sonner";

interface WalletContextState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: string | null;
  walletAvailable: boolean;
  selectedWallet: string | null;
}

const WalletContext = createContext<WalletContextState>({
  connected: false,
  connecting: false,
  disconnecting: false,
  publicKey: null,
  walletAvailable: false,
  selectedWallet: null,
});

export const useGlobalWallet = () => useContext(WalletContext);

// Monitor component to handle global wallet state changes
const WalletConnectionMonitor = ({ children }: { children: React.ReactNode }) => {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();
  
  const walletAvailable = useMemo(() => {
    // @ts-ignore
    const phantom = window?.solana?.isPhantom;
    console.log('[WalletProvider] Wallet availability:', {
      phantom,
      timestamp: new Date().toISOString()
    });
    return !!phantom;
  }, []);

  useEffect(() => {
    console.log('[WalletProvider] Connection state changed:', {
      connected,
      connecting,
      disconnecting,
      publicKey: publicKey?.toBase58(),
      selectedWallet: wallet?.adapter.name,
      timestamp: new Date().toISOString()
    });

    // Only show toasts for final states to avoid spam
    if (connected && publicKey && !connecting && !disconnecting) {
      toast.success(`Connected to ${wallet?.adapter.name || 'wallet'}`);
    }
    if (!connected && !connecting && disconnecting) {
      toast.info("Wallet disconnected");
    }
  }, [connected, connecting, disconnecting, publicKey, wallet]);

  const contextValue = useMemo(() => ({
    connected,
    connecting,
    disconnecting,
    publicKey: publicKey?.toBase58() || null,
    walletAvailable,
    selectedWallet: wallet?.adapter.name || null,
  }), [connected, connecting, disconnecting, publicKey, walletAvailable, wallet]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
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
    // Only using Phantom as the primary wallet
    const adapters = [new PhantomWalletAdapter()];
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
              // Don't show error for user cancellation
              return;
            }
            
            toast.error("Wallet error", {
              description: error.message
            });
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