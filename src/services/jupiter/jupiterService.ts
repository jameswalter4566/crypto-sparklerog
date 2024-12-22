import { Connection, PublicKey, TransactionError } from "@solana/web3.js";
import { Jupiter } from "@jup-ag/core";
import JSBI from "jsbi";

interface JupiterSwapResult {
  txid: string;
  inputAmount: bigint;
  outputAmount: bigint;
  error?: TransactionError;
}

interface SwapSuccess {
  txid: string;
  inputAmount: number;
  outputAmount: number;
}

export class JupiterService {
  private static instance: Jupiter | null = null;
  private static connection: Connection;

  static async initialize(walletPublicKey: PublicKey) {
    if (!this.connection) {
      this.connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    }

    if (!this.instance) {
      this.instance = await Jupiter.load({
        connection: this.connection,
        cluster: "mainnet-beta",
        user: walletPublicKey,
      });
    }

    return this.instance;
  }

  static async swapTokens(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100 // 1% default slippage
  ): Promise<SwapSuccess> {
    if (!this.instance) {
      throw new Error("Jupiter not initialized");
    }

    const routes = await this.instance.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount: JSBI.BigInt(amount),
      slippageBps,
      onlyDirectRoutes: false,
    });

    if (!routes.routesInfos || routes.routesInfos.length === 0) {
      throw new Error("No swap routes found");
    }

    const bestRoute = routes.routesInfos[0];
    const { execute } = await this.instance.exchange({
      routeInfo: bestRoute,
    });
    
    const swapResult = await execute();

    // Handle error case
    if ('error' in swapResult && swapResult.error) {
      throw new Error(swapResult.error.toString());
    }

    // Type guard for successful swap
    if (!this.isSuccessfulSwap(swapResult)) {
      throw new Error('Invalid swap result format');
    }

    // Return formatted success result
    return {
      txid: swapResult.txid,
      inputAmount: Number(swapResult.inputAmount),
      outputAmount: Number(swapResult.outputAmount),
    };
  }

  private static isSuccessfulSwap(result: any): result is JupiterSwapResult {
    return (
      typeof result === 'object' &&
      result !== null &&
      'txid' in result &&
      'inputAmount' in result &&
      'outputAmount' in result
    );
  }
}