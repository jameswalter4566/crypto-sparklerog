import { Keypair, Connection } from "@solana/web3.js";
import { 
  Metaplex, 
  UploadMetadataInput,
  walletAdapterIdentity
} from '@metaplex-foundation/js';

export class MetaplexService {
  private metaplex: Metaplex;

  constructor(connection: Connection) {
    this.metaplex = Metaplex.make(connection);
  }

  initializeWallet(userWallet: Keypair) {
    this.metaplex = this.metaplex.use(walletAdapterIdentity(userWallet));
  }

  async uploadMetadata(tokenMetadata: UploadMetadataInput): Promise<string> {
    const { uri } = await this.metaplex.nfts().uploadMetadata(tokenMetadata);
    console.log("Arweave URL: ", uri);
    return uri;
  }

  async getMetadataPDA(mintPublicKey: string) {
    return await this.metaplex.nfts().pdas().metadata({ mint: mintPublicKey });
  }
}