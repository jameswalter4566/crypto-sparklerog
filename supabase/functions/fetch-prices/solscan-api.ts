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
    const response = await this.makeRequest(`/token/meta?address=${address}`);
    return response;
  }

  async fetchTokenTransfers(address: string) {
    const response = await this.makeRequest(
      `/account/transfer?token=${address}&page=1&page_size=10&sort_by=block_time&sort_order=desc`
    );
    return response;
  }

  async fetchTokenMarket(address: string) {
    const response = await this.makeRequest(`/token/market?address=${address}`);
    return response;
  }

  private async makeRequest(path: string, retries = 3) {
    const url = `${SOLSCAN_API_BASE}${path}`;
    console.log(`Making request to: ${url}`);
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { 
          headers: this.headers,
          timeout: 10000
        });

        if (response.status === 404) {
          console.log('Resource not found:', url);
          return response;
        }

        if (response.ok) {
          return response;
        }

        if (response.status === 429) {
          console.warn('Rate limit hit, waiting before retry...');
          await new Promise(res => setTimeout(res, 5000));
          continue;
        }

        console.error(`Non-OK response: ${response.status} - ${response.statusText}`);
        return response;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw new Error(`Failed after ${retries} retries: ${error.message}`);
      }
    }
  }
}