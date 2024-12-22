import { useState } from 'react';
import { tokenLaunchService } from '@/services/tokenLaunchService';
import { TokenConfig } from '@/services/token/types';
import { Keypair } from '@solana/web3.js';
import { toast } from 'sonner';

export const useTokenLaunch = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const launchToken = async (config: TokenConfig, wallet: Keypair): Promise<string> => {
    setIsLaunching(true);
    try {
      tokenLaunchService.initializeMetaplex(wallet);
      const txId = await tokenLaunchService.launchToken(config, wallet);
      setTransactionId(txId);
      toast.success('Token launched successfully!');
      return txId;
    } catch (error) {
      console.error('Error launching token:', error);
      toast.error('Failed to launch token. Please try again.');
      throw error;
    } finally {
      setIsLaunching(false);
    }
  };

  const requestAirdrop = async (wallet: Keypair): Promise<string> => {
    try {
      const signature = await tokenLaunchService.requestAirdrop(wallet.publicKey);
      toast.success('Airdrop successful! 1 SOL added to your wallet.');
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
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