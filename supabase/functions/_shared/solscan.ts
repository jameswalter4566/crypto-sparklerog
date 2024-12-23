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
    
    // Using the public endpoint with proper error handling
    const response = await fetch(
      `https://api.solscan.io/token/meta?token=${address}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    console.log('Solscan response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Solscan API HTTP error:', response.status, errorText);
      return null;
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
      return null;
    }

    // Validate the response structure
    if (!data || !data.data || !data.data.tokenAddress) {
      console.error('Invalid Solscan response structure:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching Solscan data:', error);
    return null;
  }
}