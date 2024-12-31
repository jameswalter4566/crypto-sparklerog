import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemption,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
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

      // Generate the mint
      const mint = Keypair.generate();
      console.log("Generated mint address:", mint.publicKey.toString());

      // Get the rent for the mint
      const lamports = await getMinimumBalanceForRentExemption(
        MINT_SIZE,
        this.connection
      );

      // Create the mint account
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize the mint
      const initializeMintInstruction = createInitializeMintInstruction(
        mint.publicKey,
        config.decimals || 9,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_PROGRAM_ID
      );

      // Get the token account
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        wallet.publicKey
      );

      // Create the token account
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        mint.publicKey
      );

      // Calculate initial supply with decimals
      const initialSupply = config.initialSupply || 1000000000;
      const adjustedSupply = initialSupply * Math.pow(10, config.decimals || 9);

      // Mint to token account
      const mintToInstruction = createMintToInstruction(
        mint.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        adjustedSupply
      );

      // Create transaction
      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMintInstruction,
        createATAInstruction,
        mintToInstruction
      );

      // Get latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Confirm transaction
      await this.connection.confirmTransaction(signature);

      console.log("Token created successfully:", {
        mint: mint.publicKey.toString(),
        signature
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