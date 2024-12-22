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
  createCreateMetadataAccountV3Instruction,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';
import { MINT_CONFIG } from './types';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

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

    const metadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: mintAuthority.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: tokenMetadata,
          isMutable: true,
          collectionDetails: null
        }
      }
    );

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