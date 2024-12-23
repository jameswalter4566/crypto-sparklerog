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
    
    const response = await fetch(
      `https://pro-api.solscan.io/v2.0/token/meta?token=${address}`,
      {
        headers: {
          'accept': 'application/json',
          'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzM3MjgwMjU4MTMsImVtYWlsIjoiamFtZXN3YWx0ZXJAZ29sZGVucGF0aHdheWZpbmFuY2lhbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3MzM3MjgwMjV9.hOZMSTOOw-CRMuvmzgxp65-9quToMhvG-me4S2e54Ew'
        }
      }
    );

    // Log the raw response for debugging
    console.log('Solscan response status:', response.status);
    const rawData = await response.text();
    console.log('Solscan raw response:', rawData);

    if (!response.ok) {
      throw new Error(`Solscan API error: ${response.status}`);
    }

    const data = JSON.parse(rawData);
    console.log('Solscan parsed data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Solscan data:', error);
    return null;
  }
}