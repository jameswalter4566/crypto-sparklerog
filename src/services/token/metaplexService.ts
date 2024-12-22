import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { TokenConfig } from "./types";

export class MetaplexService {
  private metaplex: Metaplex;

  constructor(connection: Connection) {
    this.metaplex = Metaplex.make(connection);
  }

  initializeWallet(userWallet: Keypair): void {
    this.metaplex = this.metaplex.use(keypairIdentity(userWallet));
  }

  async uploadMetadata(tokenConfig: TokenConfig): Promise<string> {
    try {
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        description: tokenConfig.description,
        image: tokenConfig.image,
        properties: {
          numDecimals: tokenConfig.numDecimals,
          numberTokens: tokenConfig.numberTokens,
        },
      });
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