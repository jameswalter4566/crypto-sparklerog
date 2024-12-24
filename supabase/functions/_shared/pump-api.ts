export interface PumpApiConfig {
  baseUrl: string;
  searchEndpoint: string;
  directEndpoint: string;
}

export const PUMP_API_CONFIG: PumpApiConfig = {
  baseUrl: 'https://frontend-api-v2.pump.fun',
  searchEndpoint: '/coins',
  directEndpoint: '/coins'
};

export interface PumpApiParams {
  offset?: number;
  limit?: number;
  sort?: string;
  order?: string;
  includeNsfw?: boolean;
  searchTerm?: string;
}

export async function fetchFromPumpApi(
  endpoint: string,
  params: PumpApiParams,
  captchaToken?: string
): Promise<Response> {
  const searchParams = new URLSearchParams({
    offset: (params.offset || 0).toString(),
    limit: (params.limit || 50).toString(),
    sort: params.sort || 'market_cap',
    order: params.order || 'DESC',
    includeNsfw: (params.includeNsfw || false).toString(),
    ...(params.searchTerm && { searchTerm: params.searchTerm }),
    ...(captchaToken && { captchaToken })
  });

  const url = `${PUMP_API_CONFIG.baseUrl}${endpoint}?${searchParams}`;
  console.log('Fetching from Pump API:', url);

  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Origin': 'https://pump.fun',
      'Referer': 'https://pump.fun/'
    }
  });
}