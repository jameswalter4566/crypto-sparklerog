import { CoinGeckoProResponse } from './types.ts';

export async function fetchCoinGeckoData(address: string): Promise<CoinGeckoProResponse | null> {
  try {
    console.log('Fetching CoinGecko Pro data for address:', address);
    
    // First try the onchain endpoint for most accurate data
    const onchainResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/onchain/networks/solana/tokens/${address}`,
      {
        headers: {
          'accept': 'application/json',
          'x-cg-pro-api-key': 'CG-FPFWTmsu6NTuzHvntsXiRxJJ'
        }
      }
    );

    if (onchainResponse.ok) {
      const data = await onchainResponse.json();
      console.log('CoinGecko Pro onchain data:', data);
      return data;
    }

    // Fallback to the regular token info endpoint
    console.log('Falling back to token info endpoint');
    const infoResponse = await fetch(
      `https://pro-api.coingecko.com/api/v3/networks/solana/tokens/${address}/info`,
      {
        headers: {
          'accept': 'application/json',
          'x-cg-pro-api-key': 'CG-FPFWTmsu6NTuzHvntsXiRxJJ'
        }
      }
    );

    if (infoResponse.ok) {
      const data = await infoResponse.json();
      console.log('CoinGecko Pro info data:', data);
      return data;
    }

    console.warn('Failed to fetch CoinGecko Pro data:', 
      onchainResponse.status, await onchainResponse.text(),
      infoResponse.status, await infoResponse.text()
    );
    return null;
  } catch (error) {
    console.error('Error fetching CoinGecko Pro data:', error);
    return null;
  }
}