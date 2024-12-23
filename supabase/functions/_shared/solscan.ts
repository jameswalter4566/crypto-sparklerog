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
    
    // Using the token endpoint with hardcoded API key for testing
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

    console.log('Solscan response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Solscan API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Solscan API error: ${response.status} - ${errorText}`);
    }

    // Get the response text and try to parse it
    const rawText = await response.text();
    console.log('Solscan raw response:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Parsed Solscan data:', data);
    } catch (parseError) {
      console.error('Failed to parse Solscan response:', parseError);
      throw new Error('Invalid JSON response from Solscan');
    }

    // Transform the token data into our expected format
    const tokenData = {
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

    return tokenData;
  } catch (error) {
    console.error('Error fetching Solscan data:', error);
    throw error;
  }
}