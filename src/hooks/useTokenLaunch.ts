import { useState } from 'react';
import { tokenLaunchService } from '@/services/tokenLaunchService';
import { TokenConfig } from '@/services/token/types';
import { Keypair, PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';

/**
 * Custom hook for managing the token launch process and related operations.
 */
export const useTokenLaunch = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  /**
   * Launches a token using the provided configuration and wallet.
   * @param config - The token configuration (name, symbol, metadata, etc.).
   * @param wallet - The Keypair of the user's wallet.
   * @returns A promise resolving to the transaction ID of the token launch.
   */
  const launchToken = async (config: TokenConfig, wallet: Keypair): Promise<string> => {
    setIsLaunching(true);
    try {
      // Initialize Metaplex with the user's wallet
      tokenLaunchService.initializeMetaplex(wallet);

      // Launch the token and get the transaction ID
      const txId = await tokenLaunchService.launchToken(config, wallet);
      setTransactionId(txId);

      // Display success notification
      toast.success('Token launched successfully!');
      return txId;
    } catch (error) {
      console.error('Error launching token:', error);

      // Display error notification
      toast.error('Failed to launch token. Please check your configuration and try again.');
      throw error;
    } finally {
      setIsLaunching(false);
    }
  };

  /**
   * Requests an airdrop of 1 SOL for the provided wallet.
   * @param wallet - The Keypair of the user's wallet.
   * @returns A promise resolving to the transaction signature of the airdrop.
   */
  const requestAirdrop = async (wallet: Keypair): Promise<string> => {
    try {
      // Request the airdrop and retrieve the transaction signature
      const signature = await tokenLaunchService.requestAirdrop(wallet.publicKey);

      // Display success notification
      toast.success('Airdrop successful! 1 SOL added to your wallet.');
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);

      // Display error notification
      toast.error('Failed to request airdrop. Please try again later.');
      throw error;
    }
  };

  return {
    launchToken,
    requestAirdrop,
    isLaunching,
    transactionId,
  };
};
