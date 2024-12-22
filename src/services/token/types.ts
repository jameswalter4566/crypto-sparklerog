export interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  image: string;
  numDecimals: number;   // Added for decimal places
  numberTokens: number;  // Added for total supply
}

export interface OnChainMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: { address: PublicKey; verified: boolean; share: number }[] | null;
  collection: { verified: boolean; key: PublicKey } | null;
  uses: { useMethod: number; remaining: number; total: number } | null;
}
