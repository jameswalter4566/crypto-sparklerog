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
    
    // Using the correct endpoint with proper headers
    const response = await fetch(
      `https://api.solscan.io/account?address=${address}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0',
          'token': Deno.env.get('SOLSCAN_API_KEY') || ''
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

    // Validate the response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from Solscan');
    }

    // Transform the response to match our expected format
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