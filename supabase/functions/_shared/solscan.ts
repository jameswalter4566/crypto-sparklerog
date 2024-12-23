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

export async function fetchSolscanData(address: string): Promise<SolscanTokenResponse | null> {
  try {
    console.log('Fetching Solscan data for address:', address);
    
    // Using proxy endpoint to avoid Cloudflare blocks
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    console.log('DexScreener response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DexScreener API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`DexScreener API error: ${response.status} - ${errorText}`);
    }

    // Get the response text and try to parse it
    const rawText = await response.text();
    console.log('DexScreener raw response:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Parsed DexScreener data:', data);
    } catch (parseError) {
      console.error('Failed to parse DexScreener response:', parseError);
      throw new Error('Invalid JSON response from DexScreener');
    }

    // Transform the DexScreener data into our expected token format
    const pair = data.pairs?.[0] || {};
    const tokenData = {
      success: true,
      data: {
        tokenAddress: address,
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        icon: '', // DexScreener doesn't provide icons
        website: '',
        twitter: '',
        decimals: 0, // Not provided by DexScreener
        holder: 0,
        supply: parseFloat(pair.baseToken?.liquidity?.base || '0'),
        price: parseFloat(pair.priceUsd || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        marketcap: parseFloat(pair.liquidity?.usd || '0')
      }
    };

    return tokenData;
  } catch (error) {
    console.error('Error fetching DexScreener data:', error);
    throw error;
  }
}