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

    // Log the raw response for debugging
    console.log('CoinGecko onchain response status:', onchainResponse.status);
    const onchainData = await onchainResponse.text();
    console.log('CoinGecko onchain raw response:', onchainData);

    if (onchainResponse.ok) {
      const data = JSON.parse(onchainData);
      console.log('CoinGecko Pro onchain parsed data:', data);
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

    // Log the raw response for debugging
    console.log('CoinGecko info response status:', infoResponse.status);
    const infoData = await infoResponse.text();
    console.log('CoinGecko info raw response:', infoData);

    if (infoResponse.ok) {
      const data = JSON.parse(infoData);
      console.log('CoinGecko Pro info parsed data:', data);
      return data;
    }

    console.warn('Failed to fetch CoinGecko Pro data:', 
      `Onchain status: ${onchainResponse.status}`,
      `Info status: ${infoResponse.status}`
    );
    return null;
  } catch (error) {
    console.error('Error fetching CoinGecko Pro data:', error);
    return null;
  }
}