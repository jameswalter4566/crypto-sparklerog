import { 
  SystemProgram, 
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
 * Service to handle the end-to-end token launch process.
 */
export class TokenLaunchService {
  private connection: Connection;
  private metaplexService: MetaplexService;
  private tokenInstructionsService: TokenInstructionsService;

  /**
   * Constructor to initialize the TokenLaunchService.
   * @param endpoint - Solana RPC endpoint URL.
   */
  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
    this.metaplexService = new MetaplexService(this.connection);
    this.tokenInstructionsService = new TokenInstructionsService(this.connection);
  }

  /**
   * Initializes the Metaplex service with the user's wallet.
   * @param userWallet - Keypair of the user's wallet.
   */
  initializeMetaplex(userWallet: Keypair): void {
    this.metaplexService.initializeWallet(userWallet);
  }

  /**
   * Launches a new token with the given configuration.
   * @param config - Token configuration (metadata, supply, etc.).
   * @param wallet - Keypair of the wallet executing the launch.
   * @returns A promise resolving to the transaction ID of the minting process.
   */
  async launchToken(config: TokenConfig, wallet: Keypair): Promise<string> {
    try {
      console.log("--- STEP 1: Uploading Metadata ---");
      const tokenMetadata = {
        name: config.name,
        symbol: config.symbol,
        description: config.description,
        image: config.image,
      };

      // Upload metadata to Arweave
      const metadataUri = await this.metaplexService.uploadMetadata(tokenMetadata);
      console.log("Uploaded Metadata URI:", metadataUri);

      // Prepare on-chain metadata
      const onChainMetadata = {
        name: config.name,
        symbol: config.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      };

      console.log("--- STEP 2: Creating Mint and Metadata PDA ---");

      // Generate a new Keypair for the mint
      const mintKeypair = Keypair.generate();
      console.log("New Mint Address:", mintKeypair.publicKey.toString());

      // Fetch metadata PDA
      const metadataPDA = await this.metaplexService.getMetadataPDA(mintKeypair.publicKey.toString());
      console.log("Metadata PDA:", metadataPDA.toString());

      console.log("--- STEP 3: Creating Token Instructions ---");

      // Create token minting instructions
      const instructions = await this.tokenInstructionsService.createTokenInstructions(
        wallet,
        mintKeypair,
        wallet.publicKey,
        wallet.publicKey,
        wallet.publicKey,
        metadataPDA,
        onChainMetadata
      );

      console.log("--- STEP 4: Compiling and Sending Transaction ---");

      // Compile transaction
      const latestBlockhash = await this.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([wallet, mintKeypair]);

      // Send transaction
      const transactionId = await this.connection.sendTransaction(transaction);
      await this.connection.confirmTransaction({
        signature: transactionId,
        ...latestBlockhash,
      });

      console.log("Token successfully launched!");
      console.log(`Transaction ID: ${transactionId}`);
      console.log(`Explorer: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
      return transactionId;
    } catch (error) {
      console.error("Error launching token:", error);
      throw error;
    }
  }

  /**
   * Requests an airdrop of 1 SOL to the specified wallet.
   * @param wallet - PublicKey of the wallet to receive the airdrop.
   * @returns A promise resolving to the transaction ID of the airdrop.
   */
  async requestAirdrop(wallet: PublicKey): Promise<string> {
    try {
      console.log("Requesting airdrop...");
      const airdropSignature = await this.connection.requestAirdrop(wallet, LAMPORTS_PER_SOL);

      const { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
      await this.connection.confirmTransaction({
        signature: airdropSignature,
        lastValidBlockHeight,
        blockhash,
      });

      console.log("Airdrop successful!");
      console.log(`Airdrop Transaction ID: ${airdropSignature}`);
      return airdropSignature;
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      throw error;
    }
  }
}

// Initialize TokenLaunchService with an environment variable or default endpoint
export const tokenLaunchService = new TokenLaunchService(
  process.env.VITE_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
);
