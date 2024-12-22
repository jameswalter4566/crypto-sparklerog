export interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  image: string;
  numDecimals: number;
  numberTokens: number;
}

export const MINT_CONFIG = {
  numDecimals: 6,
  numberTokens: 1337
};