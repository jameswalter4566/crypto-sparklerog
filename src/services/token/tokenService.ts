import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";

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
    this.connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL, "confirmed");
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

      // Calculate rent exempt amount for the mint
      const rentExemptAmount = await this.connection.getMinimumBalanceForRentExemption(82);

      // Create the token mint account
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: walletPubKey,
        newAccountPubkey: mint.publicKey,
        lamports: rentExemptAmount,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize the mint
      const initMintIx = createInitializeMintInstruction(
        mint.publicKey,
        config.decimals || 9,
        walletPubKey,
        walletPubKey,
        TOKEN_PROGRAM_ID
      );

      // Calculate ATA address
      const ata = await PublicKey.findProgramAddress(
        [
          walletPubKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Create the token account
      const createTokenAccountIx = createAssociatedTokenAccountInstruction(
        walletPubKey,
        ata[0],
        walletPubKey,
        mint.publicKey
      );

      // Calculate initial supply with decimals
      const initialSupply = config.initialSupply || 1000000000;
      const adjustedSupply = initialSupply * Math.pow(10, config.decimals || 9);

      // Create mint to instruction
      const mintToIx = createMintToInstruction(
        mint.publicKey,
        ata[0],
        walletPubKey,
        adjustedSupply,
        []
      );

      // Combine all instructions into a single transaction
      const transaction = new Transaction().add(
        createAccountIx,
        initMintIx,
        createTokenAccountIx,
        mintToIx
      );

      // Get latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubKey;

      // Sign the transaction with the mint account
      transaction.sign(mint);

      // Request wallet signature
      const signedTx = await wallet.signTransaction(transaction);

      // Send and confirm transaction
      const txId = await this.connection.sendRawTransaction(signedTx.serialize());
      await this.connection.confirmTransaction(txId);

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