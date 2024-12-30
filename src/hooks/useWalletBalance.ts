import { useState } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const HELIUS_RPC = import.meta.env.VITE_SOLANA_RPC_URL;

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async (address: string) => {
    try {
      // @ts-ignore
      const { solana } = window;
      if (!solana?.isPhantom) return;

      const connection = new Connection(HELIUS_RPC, "confirmed");
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
  };

  return { balance, fetchBalance };
};