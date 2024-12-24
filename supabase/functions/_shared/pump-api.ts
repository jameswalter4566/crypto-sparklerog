import { CoinSearchParams } from './types.ts';

const PUMP_API_BASE_URL = 'https://frontend-api-v2.pump.fun';

export async function fetchFromPumpApi(endpoint: string, params: CoinSearchParams) {
  const queryParams = new URLSearchParams();
  
  // Add required search parameters
  if (params.searchTerm) queryParams.set('searchTerm', params.searchTerm);
  queryParams.set('limit', (params.limit || 50).toString());
  queryParams.set('offset', (params.offset || 0).toString());
  queryParams.set('sort', params.sort || 'market_cap');
  queryParams.set('order', params.order || 'DESC');
  queryParams.set('includeNsfw', (params.includeNsfw || false).toString());

  const url = `${PUMP_API_BASE_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  console.log('Making request to:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    throw error;
  }
}

// Function to fetch a specific coin by mint address
export async function fetchCoinByMint(mintAddress: string) {
  return fetchFromPumpApi('/coins', {
    searchTerm: mintAddress,
    limit: 1,
    sort: 'market_cap',
    order: 'DESC',
    includeNsfw: false
  });
}