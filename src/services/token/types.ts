import { PublicKey } from '@solana/web3.js';

export interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  image: string;
  numDecimals: number;
  numberTokens: number;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

export interface OnChainMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: null | {
    address: PublicKey;
    verified: boolean;
    share: number;
  }[];
  collection: null | {
    verified: boolean;
    key: PublicKey;
  };
  uses: null | {
    useMethod: number;
    remaining: number;
    total: number;
  };
}