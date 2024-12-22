import { 
  SystemProgram, 
  Keypair, 
  PublicKey, 
  TransactionInstruction
} from "@solana/web3.js";
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
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createMetadataV3,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';
import { Connection } from '@solana/web3.js';
import { MINT_CONFIG } from './types';

export class TokenInstructionsService {
  constructor(private connection: Connection) {}

  async createTokenInstructions(
    payer: Keypair,
    mintKeypair: Keypair,
    destinationWallet: PublicKey,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey,
    metadataPDA: PublicKey,
    tokenMetadata: DataV2
  ): Promise<TransactionInstruction[]> {
    const requiredBalance = await getMinimumBalanceForRentExemptMint(this.connection);
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, destinationWallet);

    const metadataInstruction = createMetadataV3({
      metadata: metadataPDA,
      mint: mintKeypair.publicKey,
      mintAuthority: payer,
      payer: payer,
      updateAuthority: payer.publicKey,
      data: tokenMetadata,
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
        MINT_CONFIG.numDecimals,
        mintAuthority,
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
        mintAuthority,
        MINT_CONFIG.numberTokens * Math.pow(10, MINT_CONFIG.numDecimals),
      ),
      metadataInstruction
    ];
  }
}