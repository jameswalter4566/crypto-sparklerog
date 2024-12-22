/// <reference types="vite/client" />

import { Transaction, VersionedTransaction } from '@solana/web3.js';

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: { toString(): string } }>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    disconnect(): Promise<void>;
  };
}