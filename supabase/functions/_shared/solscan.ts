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

const SOLSCAN_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzM3MjgwMjU4MTMsImVtYWlsIjoiamFtZXN3YWx0ZXJAZ29sZGVucGF0aHdheWZpbmFuY2lhbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3MzM3MjgwMjV9.hOZMSTOOw-CRMuvmzgxp65-9quToMhvG-me4S2e54Ew';

export async function fetchSolscanData(address: string): Promise<SolscanTokenResponse | null> {
  try {
    console.log('Fetching Solscan data for address:', address);
    
    // Using the free endpoint instead of the pro endpoint
    const response = await fetch(
      `https://api.solscan.io/token/meta?token=${address}`,
      {
        headers: {
          'accept': 'application/json',
          'token': SOLSCAN_API_KEY
        }
      }
    );

    console.log('Solscan response status:', response.status);
    
    // Get the raw response text first
    const rawText = await response.text();
    console.log('Solscan raw response:', rawText);

    // Try to parse the JSON response
    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Parsed Solscan data:', data);
    } catch (parseError) {
      console.error('Failed to parse Solscan response:', parseError);
      return null;
    }

    // Check both the HTTP status and the success field in the response
    if (!response.ok) {
      console.error('Solscan API HTTP error:', response.status, data);
      return null;
    }

    if (!data.success || !data.data) {
      console.error('Solscan API returned unsuccessful response:', data);
      return null;
    }

    // Validate required fields
    const requiredFields = ['tokenAddress', 'name', 'symbol'];
    for (const field of requiredFields) {
      if (!data.data[field]) {
        console.error(`Missing required field in Solscan response: ${field}`);
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching Solscan data:', error);
    return null;
  }
}