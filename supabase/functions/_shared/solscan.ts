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
    
    // Using the account endpoint with proper headers
    const response = await fetch(
      `https://public-api.solscan.io/account/${address}`,
      {
        headers: {
          'accept': 'application/json',
          'token': Deno.env.get('SOLSCAN_API_KEY') || '',
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

    // Transform the account data into our expected token format
    const tokenData = {
      success: true,
      data: {
        tokenAddress: address,
        symbol: data.tokenInfo?.symbol || 'UNKNOWN',
        name: data.tokenInfo?.name || 'Unknown Token',
        icon: data.tokenInfo?.icon || '',
        website: data.tokenInfo?.website || '',
        twitter: data.tokenInfo?.twitter || '',
        decimals: data.tokenInfo?.decimals || 0,
        holder: data.tokenInfo?.holder || 0,
        supply: data.tokenInfo?.supply || 0,
        price: data.tokenInfo?.price || 0,
        volume24h: data.tokenInfo?.volume24h || 0,
        priceChange24h: data.tokenInfo?.priceChange24h || 0,
        marketcap: data.tokenInfo?.marketcap || 0
      }
    };

    return tokenData;
  } catch (error) {
    console.error('Error fetching Solscan data:', error);
    throw error;
  }
}