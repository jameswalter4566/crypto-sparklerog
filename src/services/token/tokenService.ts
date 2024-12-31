import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
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

      // Generate the mint keypair
      const mintKeypair = Keypair.generate();
      console.log("Generated mint address:", mintKeypair.publicKey.toString());

      // Create the token mint
      const mint = await createMint(
        this.connection,
        {
          publicKey: walletPubKey,
          signTransaction: wallet.signTransaction.bind(wallet),
          signAllTransactions: wallet.signAllTransactions.bind(wallet),
        },
        walletPubKey,
        walletPubKey,
        config.decimals || 9,
        mintKeypair
      );

      // Get the token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        {
          publicKey: walletPubKey,
          signTransaction: wallet.signTransaction.bind(wallet),
          signAllTransactions: wallet.signAllTransactions.bind(wallet),
        },
        mint,
        walletPubKey
      );

      // Calculate initial supply with decimals
      const initialSupply = config.initialSupply || 1000000000;

      // Mint tokens to the user's account
      await mintToChecked(
        this.connection,
        {
          publicKey: walletPubKey,
          signTransaction: wallet.signTransaction.bind(wallet),
          signAllTransactions: wallet.signAllTransactions.bind(wallet),
        },
        mint,
        tokenAccount.address,
        walletPubKey,
        initialSupply * Math.pow(10, config.decimals || 9),
        config.decimals || 9
      );

      console.log("Token created successfully:", {
        mint: mint.toString()
      });

      // Save token metadata to Supabase
      await this.saveTokenMetadata(mint.toString(), config);

      return mint.toString();
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