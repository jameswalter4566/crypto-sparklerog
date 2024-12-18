export const SOLSCAN_API_BASE = 'https://pro-api.solscan.io/v2.0';

export interface SolscanConfig {
  apiKey: string;
}

export class SolscanAPI {
  private headers: HeadersInit;

  constructor(config: SolscanConfig) {
    this.headers = {
      'token': config.apiKey,
      'accept': 'application/json',
    };
  }

  async fetchTokenMetadata(address: string) {
    console.log('Fetching token metadata for address:', address);
    const response = await this.makeRequest(`/token/meta?address=${address}`);
    return await response.json();
  }

  async fetchTokenTransfers(address: string) {
    console.log('Fetching token transfers for address:', address);
    const response = await this.makeRequest(
      `/account/transfer?token=${address}&page=1&page_size=10&sort_by=block_time&sort_order=desc`
    );
    return await response.json();
  }

  async fetchTokenMarket(address: string) {
    console.log('Fetching token market data for address:', address);
    const response = await this.makeRequest(`/token/market?address=${address}`);
    return await response.json();
  }

  async fetchTokenPrice(address: string) {
    console.log('Fetching token price data for address:', address);
    const response = await this.makeRequest(`/token/price?address=${address}`);
    return await response.json();
  }

  private async makeRequest(path: string, retries = 3): Promise<Response> {
    const url = `${SOLSCAN_API_BASE}${path}`;
    console.log(`Making request to: ${url}`);
    console.log('Using headers:', this.headers);
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: this.headers
        });

        console.log(`Response status for ${path}:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response for ${path}:`, errorText);
          
          if (response.status === 429) {
            console.warn('Rate limit hit, waiting before retry...');
            await new Promise(res => setTimeout(res, 5000));
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed for ${path}:`, error);
        if (i === retries - 1) throw error;
      }
    }

    throw new Error(`Failed after ${retries} retries`);
  }
}