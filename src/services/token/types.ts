import { PublicKey } from '@solana/web3.js';

/**
 * Configuration for a token, including metadata and supply information.
 */
export interface TokenConfig {
  name: string;          // Name of the token
  symbol: string;        // Symbol of the token (e.g., "TKN")
  description: string;   // Description of the token
  image: string;         // URL for the token's image
  numDecimals: number;   // Number of decimal places for the token
  numberTokens: number;  // Total number of tokens to mint
}

/**
 * Metadata for a token that will be uploaded (e.g., to Arweave).
 */
export interface TokenMetadata {
  name: string;          // Name of the token
  symbol: string;        // Symbol of the token
  description: string;   // Description of the token
  image: string;         // URL for the token's image
}

/**
 * Default mint configuration for a token launch.
 */
export const MINT_CONFIG: TokenConfig = {
  name: "Default Token",
  symbol: "DFLT",
  description: "Default description for the token.",
  image: "https://example.com/default-token-image.png",
  numDecimals: 6,        // 6 decimals (e.g., 1.000000)
  numberTokens: 1337,    // Total supply of 1337 tokens
};
