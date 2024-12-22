/**
 * Interface representing the configuration for a token.
 */
export interface TokenConfig {
  name: string;          // Name of the token
  symbol: string;        // Symbol of the token (e.g., "SOL")
  description: string;   // Description of the token
  image: string;         // URL of the token's image
  numDecimals: number;   // Number of decimal places for the token
  numberTokens: number;  // Total supply of tokens to mint
}

/**
 * Default mint configuration for token creation.
 * Adjust the values as per your requirements.
 */
export const MINT_CONFIG: TokenConfig = {
  name: "Default Token",
  symbol: "DFLT",
  description: "Default token description",
  image: "https://example.com/default-token-image.png",
  numDecimals: 6, // 6 decimals (e.g., 1.000000 token)
  numberTokens: 1337, // Total of 1337 tokens
};
