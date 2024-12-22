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
  createCreateMetadataAccountV3,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';

export class TokenInstructionsService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async createTokenInstructions(
    payer: Keypair,
    mintKeypair: Keypair,
    destinationWallet: PublicKey,
    mintAuthority: Keypair,
    freezeAuthority: PublicKey,
    metadataPDA: PublicKey,
    tokenMetadata: DataV2
  ): Promise<TransactionInstruction[]> {
    const requiredBalance = await getMinimumBalanceForRentExemptMint(this.connection);
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, destinationWallet);

    const metadataInstruction = createCreateMetadataAccountV3({
      metadata: metadataPDA,
      mint: mintKeypair.publicKey,
      mintAuthority: mintAuthority.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
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
      collectionDetails: null
    });

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
        9, // Using fixed decimals since MINT_CONFIG is not exported
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
        BigInt(1000000) * BigInt(10 ** 9), // Using fixed values since MINT_CONFIG is not exported
      ),
      metadataInstruction,
    ];
  }
}