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
  
  console.log('Making request to:', url);
  console.log('Request params:', params);
  
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

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    // Get the content type header
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    // Get the content encoding header
    const contentEncoding = response.headers.get('content-encoding');
    console.log('Content-Encoding:', contentEncoding);

    // Read the complete response as text
    const rawText = await response.text();
    console.log('Complete raw response:', rawText);
    console.log('Response length:', rawText.length);
    console.log('Response headers:', response.headers);

    if (!rawText.trim()) {
      throw new Error('Empty response from API');
    }

    try {
      const parsedData = JSON.parse(rawText);
      console.log('Successfully parsed JSON data:', parsedData);
      return parsedData;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', rawText);
      throw new Error(`Invalid JSON response: ${rawText}`);
    }
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    throw error;
  }
}