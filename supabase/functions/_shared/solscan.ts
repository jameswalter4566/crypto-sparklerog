interface SolscanTokenResponse {
  success: boolean;
  data: {
    tokenAddress: string;
    symbol: string;
    name: string;
    icon: string;
    website: string;
    twitter: string;
    decimals: number;
    holder: number;
    supply: number;
    price: number;
    volume24h: number;
    priceChange24h: number;
    marketcap: number;
  };
}

async function fetchSolscanDirectly(address: string): Promise<SolscanTokenResponse | null> {
  try {
    console.log('Attempting direct Solscan fetch for:', address);
    const response = await fetch(
      `https://api.solscan.io/v2/token/meta?token=${address}`,
      {
        headers: {
          'accept': 'application/json',
          'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzQ5ODkyMTAxNzksImVtYWlsIjoiZGV0aHNxdWFkYWlyc29mdDE0NkBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3MzQ5ODkyMTB9.xw_B2uzgczFn2F-ZeW2u4tvvapS_iRvLIRKNz2DB7K0',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      console.warn('Solscan direct fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('Solscan direct fetch succeeded:', data);
    
    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: data.data?.symbol || 'UNKNOWN',
        name: data.data?.name || 'Unknown Token',
        icon: data.data?.icon || '',
        website: data.data?.website || '',
        twitter: data.data?.twitter || '',
        decimals: data.data?.decimals || 0,
        holder: data.data?.holder || 0,
        supply: data.data?.supply || 0,
        price: data.data?.price || 0,
        volume24h: data.data?.volume24h || 0,
        priceChange24h: data.data?.priceChange24h || 0,
        marketcap: data.data?.marketcap || 0
      }
    };
  } catch (error) {
    console.error('Error in direct Solscan fetch:', error);
    return null;
  }
}

async function fetchDexScreener(address: string): Promise<SolscanTokenResponse | null> {
  try {
    console.log('Attempting DexScreener fetch for:', address);
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      console.warn('DexScreener fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('DexScreener fetch succeeded:', data);
    
    const pair = data.pairs?.[0];
    if (!pair) {
      console.warn('No pairs found in DexScreener response');
      return null;
    }

    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        icon: '', // DexScreener doesn't provide icons
        website: '',
        twitter: '',
        decimals: 0,
        holder: 0,
        supply: parseFloat(pair.baseToken?.liquidity?.base || '0'),
        price: parseFloat(pair.priceUsd || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        marketcap: parseFloat(pair.liquidity?.usd || '0')
      }
    };
  } catch (error) {
    console.error('Error in DexScreener fetch:', error);
    return null;
  }
}

export async function fetchSolscanData(address: string): Promise<SolscanTokenResponse | null> {
  try {
    console.log('Starting token data fetch for address:', address);
    
    // Try Solscan first
    const solscanData = await fetchSolscanDirectly(address);
    if (solscanData) {
      console.log('Successfully fetched data from Solscan');
      return solscanData;
    }

    // If Solscan fails, try DexScreener
    console.log('Solscan fetch failed, trying DexScreener');
    const dexScreenerData = await fetchDexScreener(address);
    if (dexScreenerData) {
      console.log('Successfully fetched data from DexScreener');
      return dexScreenerData;
    }

    // If both fail, throw an error
    throw new Error('Failed to fetch token data from both Solscan and DexScreener');
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
}