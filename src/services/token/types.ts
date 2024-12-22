import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { 
  Metaplex, 
  walletAdapterIdentity, 
  bundlrStorage 
} from '@metaplex-foundation/js';
import { TokenMetadata } from './types';

/**
 * Service class to handle Metaplex operations, such as metadata upload and PDA retrieval.
 */
export class MetaplexService {
  private metaplex: Metaplex;

  /**
   * Initializes the Metaplex service with a given Solana connection.
   * @param connection - Solana connection instance.
   */
  constructor(connection: Connection) {
    this.metaplex = Metaplex.make(connection).use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      })
    );
  }

  /**
   * Associates a wallet with the Metaplex instance for identity purposes.
   * @param userWallet - The Keypair of the user's wallet.
   */
  initializeWallet(userWallet: Keypair): void {
    this.metaplex = this.metaplex.use(walletAdapterIdentity(userWallet));
  }

  /**
   * Uploads metadata to Bundlr via Metaplex.
   * @param tokenMetadata - The metadata of the token to be uploaded.
   * @returns A promise resolving to the URI of the uploaded metadata.
   */
  async uploadMetadata(tokenMetadata: TokenMetadata): Promise<string> {
    try {
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        description: tokenMetadata.description,
        image: tokenMetadata.image,
      });
      console.log("Metadata uploaded successfully:", uri);
      return uri;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw error;
    }
  }

  /**
   * Retrieves the metadata Program Derived Address (PDA) for a given mint.
   * @param mintPublicKey - The public key of the mint as a string.
   * @returns A promise resolving to the metadata PDA as a PublicKey.
   */
  async getMetadataPDA(mintPublicKey: string): Promise<PublicKey> {
    try {
      const mint = new PublicKey(mintPublicKey);
      return this.metaplex.nfts().pdas().metadata({ mint });
    } catch (error) {
      console.error("Error retrieving metadata PDA:", error);
      throw error;
    }
  }
}
