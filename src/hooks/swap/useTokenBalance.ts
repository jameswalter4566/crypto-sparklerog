import { useEffect } from 'react';
import { isValidSolanaAddress } from '@/utils/solana';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection(
  'https://rpc.helius.xyz/?api-key=726140d8-6b0d-4719-8702-682d81e94a37'
);

export const useTokenBalance = (
  tokenAddress: string,
  setTokenBalance: (balance: number | null) => void
) => {
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!tokenAddress || !isValidSolanaAddress(tokenAddress)) {
        setTokenBalance(null);
        return;
      }

      try {
        // @ts-ignore
        const { solana } = window;
        if (!solana?.isPhantom) return;

        const response = await solana.connect({ onlyIfTrusted: true });
        const userPublicKey = response.publicKey;
        
        const tokenMint = new PublicKey(tokenAddress);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          userPublicKey,
          { mint: tokenMint }
        );

        if (tokenAccounts.value.length > 0) {
          const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          setTokenBalance(balance);
        } else {
          setTokenBalance(0);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance(null);
      }
    };

    fetchTokenBalance();
  }, [tokenAddress, setTokenBalance]);
};