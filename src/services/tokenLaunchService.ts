import { 
  SystemProgram, 
  Keypair, 
  Connection, 
  PublicKey, 
  TransactionInstruction, 
  TransactionMessage, 
  VersionedTransaction,
  LAMPORTS_PER_SOL
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
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  Metaplex,
  UploadMetadataInput,
  walletAdapterIdentity,
  bundlrStorage
} from '@metaplex-foundation/js';

export interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  image: string;
  numDecimals: number;
  numberTokens: number;
}

export class TokenLaunchService {
  private connection: Connection;
  private metaplex: Metaplex;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
  }

  initializeMetaplex(userWallet: Keypair) {
    this.metaplex = Metaplex.make(this.connection)
      .use(walletAdapterIdentity(userWallet))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: this.connection.rpcEndpoint,
        timeout: 60000,
      }));
  }

  async uploadMetadata(tokenMetadata: UploadMetadataInput): Promise<string> {
    const { uri } = await this.metaplex.nfts().uploadMetadata(tokenMetadata);
    console.log("Arweave URL: ", uri);
    return uri;
  }

  async createNewMintTransaction(
    payer: Keypair,
    mintKeypair: Keypair,
    destinationWallet: PublicKey,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey,
    onChainMetadata: CreateMetadataAccountV3InstructionArgs
  ): Promise<VersionedTransaction> {
    const requiredBalance = await getMinimumBalanceForRentExemptMint(this.connection);
    const metadataPDA = await this.metaplex.nfts().pdas().metadata({ mint: mintKeypair.publicKey });
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, destinationWallet);

    const txInstructions: TransactionInstruction[] = [
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
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mintKeypair.publicKey,
          mintAuthority: payer,
          payer: payer.publicKey,
          updateAuthority: payer.publicKey,
        } as CreateMetadataAccountV3InstructionAccounts,
        {
          createMetadataAccountV3: onChainMetadata
        }
      )
    ];

    const latestBlockhash = await this.connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer, mintKeypair]);
    return transaction;
  }

  async launchToken(config: TokenConfig, wallet: Keypair): Promise<string> {
    const tokenMetadata: UploadMetadataInput = {
      name: config.name,
      symbol: config.symbol,
      description: config.description,
      image: config.image
    };

    const metadataUri = await this.uploadMetadata(tokenMetadata);
    
    const onChainMetadata: CreateMetadataAccountV3InstructionArgs = {
      data: {
        name: config.name,
        symbol: config.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
      },
      isMutable: true,
      collectionDetails: null
    };

    const mintKeypair = Keypair.generate();
    console.log("New Mint Address: ", mintKeypair.publicKey.toString());

    const transaction = await this.createNewMintTransaction(
      wallet,
      mintKeypair,
      wallet.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      onChainMetadata
    );

    const { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
    const transactionId = await this.connection.sendTransaction(transaction);
    
    await this.connection.confirmTransaction({
      signature: transactionId,
      lastValidBlockHeight,
      blockhash
    });

    return transactionId;
  }

  async requestAirdrop(wallet: PublicKey): Promise<string> {
    const airdropSignature = await this.connection.requestAirdrop(
      wallet,
      LAMPORTS_PER_SOL
    );
    
    const { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: airdropSignature,
      lastValidBlockHeight,
      blockhash
    });
    
    return airdropSignature;
  }
}

const MINT_CONFIG = {
  numDecimals: 6,
  numberTokens: 1337
};

export const tokenLaunchService = new TokenLaunchService(
  process.env.VITE_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
);