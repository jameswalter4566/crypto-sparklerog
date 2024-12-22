import { 
  SystemProgram, 
  Keypair, 
  PublicKey, 
  TransactionInstruction, 
  Connection 
} from '@solana/web3.js';
import { 
  MINT_SIZE, 
  TOKEN_PROGRAM_ID, 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createMintToInstruction 
} from '@solana/spl-token';
import { 
  createMetadataAccountV3, 
  DataV2 
} from '@metaplex-foundation/mpl-token-metadata';
import { MINT_CONFIG } from './types';

/**
 * Token metadata program ID for the Solana blockchain.
 */
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/**
 * Service to create transaction instructions for token minting and metadata creation.
 */
export class TokenInstructionsService {
  private connection: Connection;

  /**
   * Initializes the service with a Solana connection.
   * @param connection - Solana connection instance.
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Creates a list of transaction instructions for minting a token and adding metadata.
   * @param payer - The Keypair of the payer.
   * @param mintKeypair - The Keypair for the mint account.
   * @param destinationWallet - The PublicKey of the wallet receiving the minted tokens.
   * @param mintAuthority - The Keypair for the mint authority.
   * @param freezeAuthority - The PublicKey for the freeze authority.
   * @param metadataPDA - The PublicKey of the metadata PDA.
   * @param tokenMetadata - The metadata of the token (DataV2 format).
   * @returns A promise resolving to an array of TransactionInstruction objects.
   */
  async createTokenInstructions(
    payer: Keypair,
    mintKeypair: Keypair,
    destinationWallet: PublicKey,
    mintAuthority: Keypair,
    freezeAuthority: PublicKey,
    metadataPDA: PublicKey,
    tokenMetadata: DataV2
  ): Promise<TransactionInstruction[]> {
    // Fetch the required balance for rent exemption
    const requiredBalance = await getMinimumBalanceForRentExemptMint(this.connection);

    // Get the associated token address
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, destinationWallet);

    // Create metadata instruction
    const metadataInstruction = createMetadataAccountV3(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: mintAuthority.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        data: {
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          uri: tokenMetadata.uri,
          sellerFeeBasisPoints: 0,
          creators: tokenMetadata.creators || null,
          collection: tokenMetadata.collection || null,
          uses: tokenMetadata.uses || null,
        },
        isMutable: true,
      }
    );

    // Return the array of transaction instructions
    return [
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: requiredBalance,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        MINT_CONFIG.numDecimals,
        mintAuthority.publicKey,
        freezeAuthority,
        TOKEN_PROGRAM_ID
      ),
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        tokenATA,
        payer.publicKey,
        mintKeypair.publicKey,
      ),
      createMintToInstruction(
        mintKeypair.publicKey,
        tokenATA,
        mintAuthority.publicKey,
        BigInt(MINT_CONFIG.numberTokens) * BigInt(10 ** MINT_CONFIG.numDecimals),
      ),
      metadataInstruction,
    ];
  }
}
