import './buffer-polyfill';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

export async function createToken(config: TokenConfig, feePayer: PublicKey, connection: Connection) {
  try {
    // Generate a new keypair for the mint authority
    const mintAuthority = Keypair.generate();
    
    console.log("Creating new token with config:", config);
    
    // Create the token mint
    const mint = await splToken.createMint(
      connection,
      mintAuthority, // payer
      feePayer, // mintAuthority
      feePayer, // freezeAuthority
      config.decimals
    );
    
    console.log("Token mint created:", mint.toBase58());
    
    // Create associated token account
    const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      mint,
      feePayer
    );
    
    console.log("Token account created:", tokenAccount.address.toBase58());
    
    // Mint initial supply
    await splToken.mintTo(
      connection,
      mintAuthority,
      mint,
      tokenAccount.address,
      mintAuthority,
      config.initialSupply * Math.pow(10, config.decimals)
    );
    
    console.log("Initial supply minted");
    
    return {
      mintAddress: mint.toBase58(),
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