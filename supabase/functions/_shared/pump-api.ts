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
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
        'User-Agent': 'Mozilla/5.0 (compatible; PumpBot/1.0)'
      }
    });

    const responseText = await response.text();
    console.log('Raw API response:', responseText);

    if (!response.ok) {
      console.error('Pump API error response:', responseText);
      throw new Error(`API error: ${response.status}. Response: ${responseText}`);
    }

    // Try to parse the response as JSON
    try {
      const jsonData = JSON.parse(responseText);
      return jsonData;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}...`);
    }
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    throw error;
  }
}