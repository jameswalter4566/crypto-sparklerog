import { Connection, PublicKey, TransactionError } from "@solana/web3.js";
import { Jupiter } from "@jup-ag/core";
import JSBI from "jsbi";

interface JupiterSwapResult {
  txid: string;
  inputAmount: bigint;
  outputAmount: bigint;
  error?: TransactionError;
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
  ): Promise<{ txid: string; inputAmount: number; outputAmount: number }> {
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

    if ('error' in swapResult) {
      throw new Error(swapResult.error.toString());
    }

    // Now we know swapResult has the expected properties
    const result = swapResult as JupiterSwapResult;

    // Convert bigint to number for the return value
    return {
      txid: result.txid,
      inputAmount: Number(result.inputAmount),
      outputAmount: Number(result.outputAmount),
    };
  }
}