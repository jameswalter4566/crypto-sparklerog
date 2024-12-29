import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const HELIUS_RPC = import.meta.env.VITE_SOLANA_RPC_URL;

// Exponential backoff retry logic
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getBalance = async (address: string): Promise<number | null> => {
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      const connection = new Connection(HELIUS_RPC, "confirmed");
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      retries++;
      if (error.response?.status === 429) {
        console.log(`Rate limited. Retry attempt ${retries} of ${maxRetries}`);
        const delay = Math.min(1000 * Math.pow(2, retries), 10000); // Max 10s delay
        await wait(delay);
      } else if (retries === maxRetries) {
        console.error("Failed to fetch balance after max retries:", error);
        return null;
      } else {
        throw error;
      }
    }
  }
  return null;
};