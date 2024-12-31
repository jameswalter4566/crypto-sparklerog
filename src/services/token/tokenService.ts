import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";
import { validateTokenConfig, TokenValidationConfig } from "./validation";
import { TokenLogger } from "./logger";

export interface TokenConfig extends TokenValidationConfig {
  telegramLink?: string;
  websiteLink?: string;
  twitterLink?: string;
}

export class TokenService {
  private connection: Connection;
  private readonly MAX_CONFIRMATION_RETRIES = 3;
  private readonly CONFIRMATION_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      "confirmed"
    );
  }

  async createToken(config: TokenConfig): Promise<string> {
    try {
      // Validate config
      validateTokenConfig(config);
      TokenLogger.info("Token configuration validated", { config });

      // Validate wallet
      // @ts-ignore
      if (!window.solana?.isPhantom) {
        throw new Error("Please install Phantom wallet to create tokens");
      }

      // @ts-ignore
      const wallet = window.solana;
      if (!wallet.publicKey) {
        throw new Error("Please connect your Phantom wallet to continue");
      }

      TokenLogger.info("Wallet validated", { publicKey: wallet.publicKey.toString() });

      // Convert wallet.publicKey to PublicKey instance
      const walletPubKey = new PublicKey(wallet.publicKey.toString());

      // Generate the mint
      const mint = Keypair.generate();
      TokenLogger.info("Generated mint keypair", { 
        mintAddress: mint.publicKey.toString() 
      });

      // Calculate rent exempt amount
      const rentExemptAmount = await this.connection.getMinimumBalanceForRentExemption(82);

      // Create instructions
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: walletPubKey,
        newAccountPubkey: mint.publicKey,
        lamports: rentExemptAmount,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

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

      const createTokenAccountIx = createAssociatedTokenAccountInstruction(
        walletPubKey,
        ata[0],
        walletPubKey,
        mint.publicKey
      );

      // Calculate initial supply with BigInt
      const initialSupply = config.initialSupply || 1000000000;
      const decimals = config.decimals || 9;
      const adjustedSupply = BigInt(initialSupply) * BigInt(10 ** decimals);

      const mintToIx = createMintToInstruction(
        mint.publicKey,
        ata[0],
        walletPubKey,
        Number(adjustedSupply), // Convert back to number as the API expects it
        []
      );

      // Build transaction
      const transaction = new Transaction().add(
        createAccountIx,
        initMintIx,
        createTokenAccountIx,
        mintToIx
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubKey;

      // Sign with mint account
      transaction.sign(mint);

      // Request wallet signature
      const signedTx = await wallet.signTransaction(transaction);

      // Send and confirm with enhanced checks
      const txId = await this.connection.sendRawTransaction(signedTx.serialize());
      TokenLogger.info("Transaction sent", { txId });

      await this.confirmTransactionWithRetry(txId);
      TokenLogger.info("Transaction confirmed", { txId });

      // Save metadata
      await this.saveTokenMetadata(mint.publicKey.toString(), config);
      TokenLogger.info("Token metadata saved", { 
        mintAddress: mint.publicKey.toString() 
      });

      toast.success("Token created successfully!");
      return mint.publicKey.toString();
    } catch (error) {
      TokenLogger.error("Error creating token", error);
      toast.error(error instanceof Error ? error.message : "Failed to create token");
      throw error;
    }
  }

  private async confirmTransactionWithRetry(
    txId: string,
    commitment: Commitment = 'finalized'
  ): Promise<void> {
    let retries = 0;
    
    while (retries < this.MAX_CONFIRMATION_RETRIES) {
      try {
        const { value } = await Promise.race([
          this.connection.confirmTransaction(txId, commitment),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Transaction confirmation timeout")), 
            this.CONFIRMATION_TIMEOUT)
          )
        ]);

        if (value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);
        }

        return;
      } catch (error) {
        retries++;
        TokenLogger.warn(`Confirmation attempt ${retries} failed`, { txId, error });
        
        if (retries >= this.MAX_CONFIRMATION_RETRIES) {
          throw new Error("Failed to confirm transaction after multiple attempts");
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  private async saveTokenMetadata(
    mintAddress: string,
    config: TokenConfig
  ): Promise<void> {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      let imageUrl = null;
      if (config.image) {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('token-images')
          .upload(`${mintAddress}/${config.image.name}`, config.image);

        if (uploadError) {
          TokenLogger.error("Failed to upload token image", uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase
          .storage
          .from('token-images')
          .getPublicUrl(`${mintAddress}/${config.image.name}`);
          
        imageUrl = publicUrl;
      }

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

      if (error) {
        TokenLogger.error("Failed to save token metadata", error);
        throw error;
      }
    } catch (error) {
      TokenLogger.error("Error in saveTokenMetadata", error);
      toast.error("Failed to save token metadata");
      throw error;
    }
  }
}

export const tokenService = new TokenService();