import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

export async function createToken(config: TokenConfig) {
  try {
    // Initialize connection to Solana devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    // Generate a new keypair for the mint authority
    const mintAuthority = Keypair.generate();
    
    console.log("Creating new token with config:", config);
    
    // Create the token mint
    const mint = await Token.createMint(
      connection,
      mintAuthority,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      config.decimals,
      TOKEN_PROGRAM_ID
    );
    
    console.log("Token mint created:", mint.publicKey.toBase58());
    
    // Create associated token account
    const tokenAccount = await mint.getOrCreateAssociatedAccountInfo(
      mintAuthority.publicKey
    );
    
    console.log("Token account created:", tokenAccount.address.toBase58());
    
    // Mint initial supply
    await mint.mintTo(
      tokenAccount.address,
      mintAuthority,
      [],
      config.initialSupply * Math.pow(10, config.decimals)
    );
    
    console.log("Initial supply minted");
    
    return {
      mintAddress: mint.publicKey.toBase58(),
      tokenAccount: tokenAccount.address.toBase58(),
      mintAuthority: mintAuthority.publicKey.toBase58(),
      success: true
    };
  } catch (error) {
    console.error("Error creating token:", error);
    return {
      success: false,
      error: error.message
    };
  }
}