import { 
  SystemProgram, 
  Keypair, 
  PublicKey, 
  TransactionInstruction 
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
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  createCreateMetadataAccountV3Instruction,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';
import { Connection } from '@solana/web3.js';
import { MINT_CONFIG } from './types';

export class TokenInstructionsService {
  constructor(private connection: Connection) {}

  /**
   * Creates token instructions for initializing a new token mint and associated metadata.
   * @param payer - Keypair of the payer responsible for transaction fees.
   * @param mintKeypair - Keypair for the new token mint.
   * @param destinationWallet - Public key of the wallet receiving the minted tokens.
   * @param mintAuthority - Public key with minting authority for the token.
   * @param freezeAuthority - Public key with freeze authority for the token.
   * @param metadataPDA - Metadata account public key.
   * @param tokenMetadata - Metadata information for the token.
   * @returns Array of transaction instructions to be executed.
   */
  async createTokenInstructions(
    payer: Keypair,
    mintKeypair: Keypair,
    destinationWallet: PublicKey,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey,
    metadataPDA: PublicKey,
    tokenMetadata: DataV2
  ): Promise<TransactionInstruction[]> {
    try {
      // Get required lamports for rent exemption
      const requiredBalance = await getMinimumBalanceForRentExemptMint(this.connection);

      // Associated token account for the mint
      const tokenATA = await getAssociatedTokenAddress(
        mintKeypair.publicKey, 
        destinationWallet
      );

      // Metadata instruction accounts
      const accounts: CreateMetadataAccountV3InstructionAccounts = {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: mintAuthority,
        payer: payer.publicKey,
        updateAuthority: mintAuthority,
      };

      // Metadata instruction args
      const args: CreateMetadataAccountV3InstructionArgs = {
        data: tokenMetadata,
        isMutable: true,
        collectionDetails: null,
      };

      // Create metadata account instruction
      const metadataInstruction = createCreateMetadataAccountV3Instruction(accounts, args);

      // Construct the array of instructions
      return [
        // Create mint account
        SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: requiredBalance,
          programId: TOKEN_PROGRAM_ID,
        }),
        // Initialize mint
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          MINT_CONFIG.numDecimals,
          mintAuthority,
          freezeAuthority,
          TOKEN_PROGRAM_ID
        ),
        // Create associated token account
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          tokenATA,
          payer.publicKey,
          mintKeypair.publicKey,
        ),
        // Mint tokens to associated token account
        createMintToInstruction(
          mintKeypair.publicKey,
          tokenATA,
          mintAuthority,
          MINT_CONFIG.numberTokens * Math.pow(10, MINT_CONFIG.numDecimals),
        ),
        // Create metadata account
        metadataInstruction
      ];
    } catch (error) {
      console.error("Error creating token instructions:", error);
      throw new Error("Failed to create token instructions. Please check your inputs and try again.");
    }
  }
}
