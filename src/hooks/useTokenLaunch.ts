import { useState } from 'react';
import { tokenLaunchService } from '@/services/tokenLaunchService';
import { TokenConfig } from '@/services/token/types';
import { Keypair } from '@solana/web3.js';
import { toast } from 'sonner';

/**
 * Custom hook to manage the token launch process and related actions.
 */
export const useTokenLaunch = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  /**
   * Launches a token using the provided configuration and wallet.
   * @param config - The configuration of the token to launch.
   * @param wallet - The Keypair of the wallet launching the token.
   * @returns A promise resolving to the transaction ID.
   */
  const launchToken = async (config: TokenConfig, wallet: Keypair): Promise<string> => {
    setIsLaunching(true);
    try {
      // Initialize Metaplex with the wallet
      tokenLaunchService.initializeMetaplex(wallet);

      // Launch the token and get the transaction ID
      const txId = await tokenLaunchService.launchToken(config, wallet);
      setTransactionId(txId);

      // Show success message
      toast.success('Token launched successfully!');
      return txId;
    } catch (error) {
      console.error('Error launching token:', error);

      // Show error message
      toast.error('Failed to launch token. Please try again.');
      throw error;
    } finally {
      setIsLaunching(false);
    }
  };

  /**
   * Requests an airdrop of 1 SOL for the provided wallet.
   * @param wallet - The Keypair of the wallet requesting the airdrop.
   * @returns A promise resolving to the transaction signature of the airdrop.
   */
  const requestAirdrop = async (wallet: Keypair): Promise<string> => {
    try {
      // Request the airdrop and get the transaction signature
      const signature = await tokenLaunchService.requestAirdrop(wallet.publicKey);

      // Show success message
      toast.success('Airdrop successful! 1 SOL added to your wallet.');
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);

      // Show error message
      toast.error('Failed to request airdrop. Please try again.');
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
