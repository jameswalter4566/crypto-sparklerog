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
    
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        console.log(`Token ${index} detailed info:`, {
          mint: item.mint,
          name: item.name,
          symbol: item.symbol,
          usd_market_cap: item.usd_market_cap,
          virtual_sol_reserves: item.virtual_sol_reserves,
          virtual_token_reserves: item.virtual_token_reserves,
          total_supply: item.total_supply
        });

        // Log derived values
        const solInUsd = 0.6; // Current approximate SOL price
        const liquidityInUsd = item.virtual_sol_reserves 
          ? (item.virtual_sol_reserves / 1e9) * solInUsd 
          : null;
        const priceInUsd = item.usd_market_cap && item.total_supply
          ? item.usd_market_cap / (item.total_supply / 1e9)
          : null;

        console.log(`Token ${index} calculated values:`, {
          priceInUsd,
          marketCapUsd: item.usd_market_cap,
          liquidityInUsd,
          totalSupply: item.total_supply / 1e9,
          virtualSolReserves: item.virtual_sol_reserves / 1e9
        });
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching from Pump API:', error);
    throw error;
  }
}