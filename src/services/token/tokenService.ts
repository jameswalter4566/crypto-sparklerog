import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { 
  createInitializeMint,
  createAccount,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress as getAssociatedTokenAddr,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";

const HELIUS_RPC = import.meta.env.VITE_SOLANA_RPC_URL;

export interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  image?: File;
  decimals?: number;
  initialSupply?: number;
  telegramLink?: string;
  websiteLink?: string;
  twitterLink?: string;
}

export class TokenService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(HELIUS_RPC, "confirmed");
  }

  async createToken(config: TokenConfig): Promise<string> {
    try {
      // @ts-ignore
      if (!window.solana?.isPhantom) {
        throw new Error("Phantom wallet not found!");
      }

      // @ts-ignore
      const wallet = window.solana;
      if (!wallet.publicKey) {
        throw new Error("Please connect your wallet first!");
      }

      console.log("Creating token with config:", config);

      // Convert wallet.publicKey to PublicKey instance
      const walletPubKey = new PublicKey(wallet.publicKey.toString());

      // Generate the mint
      const mint = Keypair.generate();
      console.log("Generated mint address:", mint.publicKey.toString());

      // Create the token mint
      const mintRent = await this.connection.getMinimumBalanceForRentExemption(82);
      const createMintTx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: walletPubKey,
          newAccountPubkey: mint.publicKey,
          space: 82,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint(
          mint.publicKey,
          config.decimals || 9,
          walletPubKey,
          walletPubKey,
          TOKEN_PROGRAM_ID
        )
      );

      // Get the token account
      const associatedTokenAccount = await getAssociatedTokenAddr(
        mint.publicKey,
        walletPubKey
      );

      // Create the token account
      const createATATx = new Transaction().add(
        await createAssociatedTokenAccount(
          this.connection,
          walletPubKey,
          mint.publicKey,
          walletPubKey
        )
      );

      // Calculate initial supply with decimals
      const initialSupply = config.initialSupply || 1000000000;
      const adjustedSupply = initialSupply * Math.pow(10, config.decimals || 9);

      // Mint to token account
      const mintToTx = new Transaction().add(
        mintTo({
          mint: mint.publicKey,
          destination: associatedTokenAccount,
          amount: adjustedSupply,
          authority: walletPubKey,
        })
      );

      // Get latest blockhash and sign transactions
      const { blockhash } = await this.connection.getLatestBlockhash();
      createMintTx.recentBlockhash = blockhash;
      createMintTx.feePayer = walletPubKey;
      createATATx.recentBlockhash = blockhash;
      createATATx.feePayer = walletPubKey;
      mintToTx.recentBlockhash = blockhash;
      mintToTx.feePayer = walletPubKey;

      // Sign and send transactions
      const signedCreateMintTx = await wallet.signTransaction(createMintTx);
      const signedCreateATATx = await wallet.signTransaction(createATATx);
      const signedMintToTx = await wallet.signTransaction(mintToTx);

      // Send transactions
      await this.connection.sendRawTransaction(signedCreateMintTx.serialize());
      await this.connection.sendRawTransaction(signedCreateATATx.serialize());
      await this.connection.sendRawTransaction(signedMintToTx.serialize());

      console.log("Token created successfully:", {
        mint: mint.publicKey.toString()
      });

      // Save token metadata to Supabase
      await this.saveTokenMetadata(mint.publicKey.toString(), config);

      return mint.publicKey.toString();
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  }

  private async saveTokenMetadata(
    mintAddress: string,
    config: TokenConfig
  ): Promise<void> {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Upload image if provided
      let imageUrl = null;
      if (config.image) {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('token-images')
          .upload(`${mintAddress}/${config.image.name}`, config.image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase
          .storage
          .from('token-images')
          .getPublicUrl(`${mintAddress}/${config.image.name}`);
          
        imageUrl = publicUrl;
      }

      // Save token data
      const { error } = await supabase
        .from('coins')
        .insert({
          id: mintAddress,
          name: config.name,
          symbol: config.symbol,
          description: config.description,
          image_url: imageUrl,
          solana_addr: mintAddress,
          total_supply: config.initialSupply || 1000000000,
          decimals: config.decimals || 9,
          homepage: config.websiteLink,
          twitter_screen_name: config.twitterLink?.split('/').pop(),
          chat_url: config.telegramLink ? [config.telegramLink] : null,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving token metadata:", error);
      toast.error("Failed to save token metadata");
      throw error;
    }
  }
}

export const tokenService = new TokenService();