import { 
  Keypair, 
  Connection, 
  PublicKey, 
  TransactionMessage, 
  VersionedTransaction, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { TokenConfig } from './token/types';
import { MetaplexService } from './token/metaplexService';
import { TokenInstructionsService } from './token/tokenInstructionsService';

/**
 * Service to handle the process of launching a token on Solana.
 */
export class TokenLaunchService {
  private connection: Connection;
  private metaplexService: MetaplexService;
  private tokenInstructionsService: TokenInstructionsService;

  /**
   * Initializes the TokenLaunchService with an RPC endpoint.
   * @param endpoint - Solana RPC endpoint URL.
   */
  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
    this.metaplexService = new MetaplexService(this.connection);
    this.tokenInstructionsService = new TokenInstructionsService(this.connection);
  }

  /**
   * Initializes the Metaplex instance with the user's wallet.
   * @param userWallet - The Keypair of the user's wallet.
   */
  initializeMetaplex(userWallet: Keypair): void {
    this.metaplexService.initializeWallet(userWallet);
  }

  /**
   * Launches a token using the provided configuration and wallet.
   * @param config - The token configuration (metadata, supply, etc.).
   * @param wallet - The Keypair of the user's wallet.
   * @returns A promise resolving to the transaction ID of the minting process.
   */
  async launchToken(config: TokenConfig, wallet: Keypair): Promise<string> {
    try {
      console.log("--- STEP 1: Uploading Metadata ---");
      const metadataUri = await this.metaplexService.uploadMetadata(config);
      console.log("Metadata uploaded successfully:", metadataUri);

      const onChainMetadata = {
        name: config.name,
        symbol: config.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null, // Optional: Add creators if needed
        collection: null, // Optional: Add collection if applicable
        uses: null, // Optional: Define usage restrictions if applicable
        decimals: config.numDecimals, // Include decimals for the token
        supply: config.numberTokens, // Include total supply
      };

      console.log("--- STEP 2: Creating Mint and Metadata PDA ---");
      const mintKeypair = Keypair.generate();
      console.log("Generated Mint Address:", mintKeypair.publicKey.toString());

      const metadataPDA = await this.metaplexService.getMetadataPDA(mintKeypair.publicKey.toString());
      console.log("Metadata PDA:", metadataPDA.toString());

      console.log("--- STEP 3: Creating Token Instructions ---");
      const instructions = await this.tokenInstructionsService.createTokenInstructions(
        wallet,
        mintKeypair,
        wallet.publicKey,
        wallet,
        wallet.publicKey,
        metadataPDA,
        {
          ...onChainMetadata,
        }
      );

      console.log("--- STEP 4: Compiling and Sending Transaction ---");
      const latestBlockhash = await this.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([wallet, mintKeypair]);

      console.log("Sending transaction...");
      const transactionId = await this.connection.sendTransaction(transaction);
      console.log("Transaction sent:", transactionId);

      console.log("--- STEP 5: Confirming Transaction ---");
      await this.connection.confirmTransaction({
        signature: transactionId,
        ...latestBlockhash,
      });
      console.log("Transaction confirmed successfully!");

      return transactionId;
    } catch (error) {
      console.error("Error during token launch:", error);
      throw error;
    }
  }

  /**
   * Requests an airdrop of 1 SOL for the specified wallet.
   * @param wallet - The PublicKey of the wallet to receive the airdrop.
   * @returns A promise resolving to the transaction signature of the airdrop.
   */
  async requestAirdrop(wallet: PublicKey): Promise<string> {
    try {
      console.log("Requesting airdrop for wallet:", wallet.toString());
      const airdropSignature = await this.connection.requestAirdrop(wallet, LAMPORTS_PER_SOL);

      const { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        signature: airdropSignature,
        lastValidBlockHeight,
        blockhash,
      });

      console.log("Airdrop successful:", airdropSignature);
      return airdropSignature;
    } catch (error) {
      console.error("Error during airdrop request:", error);
      throw error;
    }
  }
}

// Export a singleton instance of the service with the environment-configured endpoint
export const tokenLaunchService = new TokenLaunchService(
  process.env.VITE_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
);
