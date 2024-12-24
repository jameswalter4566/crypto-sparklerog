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
  console.log('Request params:', JSON.stringify(params, null, 2));
  
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

    const rawText = await response.text();
    console.log('Raw API Response:', rawText);

    try {
      const parsedData = JSON.parse(rawText);
      console.log('Parsed API Response:', JSON.stringify(parsedData, null, 2));
      
      // Log detailed token information
      if (Array.isArray(parsedData)) {
        parsedData.forEach((item, index) => {
          console.log(`Token ${index} detailed info:`, {
            mint: item.mint,
            name: item.name,
            symbol: item.symbol,
            price: item.price,
            price_usd: item.price_usd,
            total_supply: item.total_supply,
            market_cap: item.market_cap,
            virtual_sol_reserves: item.virtual_sol_reserves,
            circulating_supply: item.circulating_supply,
            non_circulating_supply: item.non_circulating_supply
          });

          // Calculate and log derived values
          const calculatedMarketCap = item.price_usd && item.total_supply 
            ? item.price_usd * item.total_supply 
            : null;
          const liquidityInUsd = item.virtual_sol_reserves && item.price 
            ? item.virtual_sol_reserves * item.price 
            : null;

          console.log(`Token ${index} calculated values:`, {
            calculatedMarketCap,
            liquidityInUsd
          });
        });
      }
      
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