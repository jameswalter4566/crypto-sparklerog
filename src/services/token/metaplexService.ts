import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import { 
  Metaplex, 
  walletAdapterIdentity,
  MetaplexPlugin
} from '@metaplex-foundation/js';
import { TokenMetadata } from './types';

export class MetaplexService {
  private metaplex: Metaplex;

  constructor(connection: Connection) {
    this.metaplex = Metaplex.make(connection);
  }

  initializeWallet(userWallet: Keypair) {
    this.metaplex = this.metaplex.use(walletAdapterIdentity(userWallet));
  }

  async uploadMetadata(tokenMetadata: TokenMetadata): Promise<string> {
    const { uri } = await this.metaplex.nfts().uploadMetadata({
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      description: tokenMetadata.description,
      image: tokenMetadata.image
    });
    console.log("Metadata URI:", uri);
    return uri;
  }

  async getMetadataPDA(mintPublicKey: string): Promise<PublicKey> {
    const mint = new PublicKey(mintPublicKey);
    return this.metaplex.nfts().pdas().metadata({ mint });
  }
}