import { CoinSearchParams } from './types.ts';

const PUMP_API_BASE_URL = 'https://frontend-api-v2.pump.fun';

export async function fetchFromPumpApi(endpoint: string, params: CoinSearchParams) {
  const queryParams = new URLSearchParams();
  
  if (params.searchTerm) queryParams.set('searchTerm', params.searchTerm);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  if (params.sort) queryParams.set('sort', params.sort);
  if (params.order) queryParams.set('order', params.order);
  if (params.includeNsfw !== undefined) queryParams.set('includeNsfw', params.includeNsfw.toString());
  if (params.captchaToken) queryParams.set('captchaToken', params.captchaToken);

  const url = `${PUMP_API_BASE_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  console.log('Fetching from Pump API:', url);
  
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
        'User-Agent': 'Mozilla/5.0 (compatible; PumpBot/1.0)'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // First check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pump API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    // Get the raw response text for debugging
    const rawText = await response.text();
    console.log('Raw API response:', rawText);

    // If we got an empty response, throw an error
    if (!rawText.trim()) {
      throw new Error('Empty response from API');
    }

    // Try to parse JSON
    try {
      return JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Invalid JSON response: ${rawText.slice(0, 200)}...`);
    }
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    throw error;
  }
}