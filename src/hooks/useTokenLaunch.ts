import { useState } from 'react';
import { tokenLaunchService } from '@/services/tokenLaunchService';
import { TokenConfig } from '@/services/token/types';
import { Keypair } from '@solana/web3.js';
import { toast } from 'sonner';

export const useTokenLaunch = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const launchToken = async (config: TokenConfig, wallet: Keypair) => {
    setIsLaunching(true);
    try {
      tokenLaunchService.initializeMetaplex(wallet);
      const txId = await tokenLaunchService.launchToken(config, wallet);
      setTransactionId(txId);
      toast.success('Token launched successfully!');
      return txId;
    } catch (error) {
      console.error('Error launching token:', error);
      toast.error('Failed to launch token');
      throw error;
    } finally {
      setIsLaunching(false);
    }
  };

  const requestAirdrop = async (wallet: Keypair) => {
    try {
      const signature = await tokenLaunchService.requestAirdrop(wallet.publicKey);
      toast.success('Airdrop successful!');
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      toast.error('Failed to request airdrop');
      throw error;
    }
  };

  return {
    launchToken,
    requestAirdrop,
    isLaunching,
    transactionId
  };
};