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

export class TokenLaunchService {
  private connection: Connection;
  private metaplexService: MetaplexService;
  private tokenInstructionsService: TokenInstructionsService;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
    this.metaplexService = new MetaplexService(this.connection);
    this.tokenInstructionsService = new TokenInstructionsService(this.connection);
  }

  initializeMetaplex(userWallet: Keypair): void {
    this.metaplexService.initializeWallet(userWallet);
  }

  async launchToken(config: TokenConfig, wallet: Keypair): Promise<string> {
    try {
      console.log("Starting token launch process...");
      
      const metadataUri = await this.metaplexService.uploadMetadata({
        name: config.name,
        symbol: config.symbol,
        description: config.description,
        image: config.image
      });
      
      console.log("Metadata uploaded, URI:", metadataUri);

      const onChainMetadata = {
        name: config.name,
        symbol: config.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
      };

      const mintKeypair = Keypair.generate();
      console.log("Mint address:", mintKeypair.publicKey.toString());

      const metadataPDA = await this.metaplexService.getMetadataPDA(mintKeypair.publicKey.toString());
      console.log("Metadata PDA:", metadataPDA.toString());

      const instructions = await this.tokenInstructionsService.createTokenInstructions(
        wallet,
        mintKeypair,
        wallet.publicKey,
        wallet.publicKey,
        wallet.publicKey,
        metadataPDA,
        onChainMetadata
      );

      const latestBlockhash = await this.connection.getLatestBlockhash();
      
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([wallet, mintKeypair]);

      const transactionId = await this.connection.sendTransaction(transaction);
      console.log("Transaction sent:", transactionId);
      
      await this.connection.confirmTransaction({
        signature: transactionId,
        ...latestBlockhash
      });

      console.log("Transaction confirmed!");
      return transactionId;
    } catch (error) {
      console.error("Error in launchToken:", error);
      throw error;
    }
  }

  async requestAirdrop(wallet: PublicKey): Promise<string> {
    try {
      console.log("Requesting airdrop for:", wallet.toString());
      const airdropSignature = await this.connection.requestAirdrop(
        wallet,
        LAMPORTS_PER_SOL
      );
      
      const { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        signature: airdropSignature,
        lastValidBlockHeight,
        blockhash
      });
      
      console.log("Airdrop successful:", airdropSignature);
      return airdropSignature;
    } catch (error) {
      console.error("Error in requestAirdrop:", error);
      throw error;
    }
  }
}

export const tokenLaunchService = new TokenLaunchService(
  process.env.VITE_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
);