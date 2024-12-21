import './buffer-polyfill';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  feePayer: PublicKey;
  connection: Connection;
}

export async function createToken(config: TokenConfig) {
  try {
    // Generate a new keypair for the mint authority
    const mintAuthority = Keypair.generate();
    
    console.log("Creating new token with config:", config);
    
    // Create the token mint
    const mint = await splToken.createMint(
      config.connection,
      mintAuthority,
      config.feePayer,
      config.feePayer,
      config.decimals
    );
    
    console.log("Token mint created:", mint.toBase58());
    
    // Create associated token account
    const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      config.connection,
      mintAuthority,
      mint,
      config.feePayer
    );
    
    console.log("Token account created:", tokenAccount.address.toBase58());
    
    // Mint initial supply
    await splToken.mintTo(
      config.connection,
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