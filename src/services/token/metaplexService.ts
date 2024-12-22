import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import { 
  Metaplex, 
  UploadMetadataInput, 
  walletAdapterIdentity 
} from '@metaplex-foundation/js';

/**
 * A service class to interact with Metaplex functionalities, including uploading metadata and retrieving PDAs.
 */
export class MetaplexService {
  private metaplex: Metaplex;

  /**
   * Initializes the MetaplexService with a Solana connection.
   * @param connection - Solana connection instance.
   */
  constructor(connection: Connection) {
    this.metaplex = Metaplex.make(connection);
  }

  /**
   * Associates a wallet with the Metaplex instance.
   * @param userWallet - The Keypair of the user wallet to initialize.
   */
  initializeWallet(userWallet: Keypair): void {
    this.metaplex = this.metaplex.use(walletAdapterIdentity(userWallet));
  }

  /**
   * Uploads metadata to Arweave via Metaplex.
   * @param tokenMetadata - Metadata of the token to be uploaded.
   * @returns A promise resolving to the URI of the uploaded metadata.
   */
  async uploadMetadata(tokenMetadata: UploadMetadataInput): Promise<string> {
    try {
      const { uri } = await this.metaplex.nfts().uploadMetadata(tokenMetadata);
      console.log("Arweave URL:", uri);
      return uri;
    } catch (error) {
      console.error("Failed to upload metadata:", error);
      throw error;
    }
  }

  /**
   * Retrieves the metadata PDA (Program Derived Address) for a given mint.
   * @param mintPublicKey - The public key of the mint as a string.
   * @returns A promise resolving to the PDA as a PublicKey.
   */
  async getMetadataPDA(mintPublicKey: string): Promise<PublicKey> {
    try {
      return this.metaplex.nfts().pdas().metadata({
        mint: new PublicKey(mintPublicKey),
      });
    } catch (error) {
      console.error("Failed to retrieve metadata PDA:", error);
      throw error;
    }
  }
}
