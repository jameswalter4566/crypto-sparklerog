import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import { 
  Metaplex, 
  bundlrStorage,
  walletAdapterIdentity
} from '@metaplex-foundation/js';
import { TokenMetadata } from './types';

export class MetaplexService {
  private metaplex: Metaplex;

  constructor(connection: Connection) {
    this.metaplex = Metaplex.make(connection)
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }));
  }

  initializeWallet(userWallet: Keypair): void {
    this.metaplex = this.metaplex.use(walletAdapterIdentity(userWallet));
  }

  async uploadMetadata(tokenMetadata: TokenMetadata): Promise<string> {
    try {
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        description: tokenMetadata.description,
        image: tokenMetadata.image
      });
      console.log("Metadata uploaded successfully:", uri);
      return uri;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw error;
    }
  }

  async getMetadataPDA(mintPublicKey: string): Promise<PublicKey> {
    const mint = new PublicKey(mintPublicKey);
    return this.metaplex.nfts().pdas().metadata({ mint });
  }
}