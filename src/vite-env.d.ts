/// <reference types="vite/client" />

import { Transaction, VersionedTransaction } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isConnected?: boolean;
      publicKey?: { toString(): string };
      connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
      signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
      disconnect(): Promise<void>;
      on(event: string, callback: () => void): void;
      removeListener(event: string, callback: () => void): void;
    };
  }
}