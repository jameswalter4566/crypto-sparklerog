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
        'Accept': '*/*',
        'Accept-Encoding': 'gzip',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pump API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    // Get the content type header
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    // Get the content encoding header
    const contentEncoding = response.headers.get('content-encoding');
    console.log('Content-Encoding:', contentEncoding);

    // Read the response as an ArrayBuffer first
    const buffer = await response.arrayBuffer();
    
    // If the response is empty, throw an error
    if (buffer.byteLength === 0) {
      throw new Error('Empty response from API');
    }

    // Convert ArrayBuffer to text
    const decoder = new TextDecoder();
    const text = decoder.decode(buffer);
    console.log('Decoded response text:', text);

    // If we got an empty response after decoding, throw an error
    if (!text.trim()) {
      throw new Error('Empty response from API after decoding');
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text that failed to parse:', text);
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}...`);
    }
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    throw error;
  }
}