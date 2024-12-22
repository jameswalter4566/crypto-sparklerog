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

export const MINT_CONFIG = {
  numDecimals: 6,
  numberTokens: 1337
};