import { CoinData } from './types';

export function mapPumpApiData(data: any, tokenAddress: string): CoinData {
  console.log('Mapping data for token:', tokenAddress);
  
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure received from API');
  }

  return {
    id: tokenAddress,
    name: data.name || 'Unknown Token',
    symbol: data.symbol || '???',
    image_url: data.image_uri || data.image || null,
    price: typeof data.price === 'number' && !isNaN(data.price) ? data.price : null,
    change_24h: typeof data.price_change_24h === 'number' && !isNaN(data.price_change_24h) ? data.price_change_24h : null,
    market_cap: typeof data.market_cap === 'number' && !isNaN(data.market_cap) ? data.market_cap : null,
    volume_24h: typeof data.volume_24h === 'number' && !isNaN(data.volume_24h) ? data.volume_24h : null,
    liquidity: typeof data.virtual_sol_reserves === 'number' && !isNaN(data.virtual_sol_reserves) ? data.virtual_sol_reserves : null,
    total_supply: typeof data.total_supply === 'number' && !isNaN(data.total_supply) ? data.total_supply : null,
    circulating_supply: typeof data.circulating_supply === 'number' && !isNaN(data.circulating_supply) ? data.circulating_supply : null,
    non_circulating_supply: typeof data.non_circulating_supply === 'number' ? data.non_circulating_supply : null,
    updated_at: new Date().toISOString(),
    solana_addr: tokenAddress,
    description: data.description || null,
    decimals: typeof data.decimals === 'number' ? data.decimals : null,
    historic_data: Array.isArray(data.price_history) ? data.price_history : null,
    homepage: data.website || null,
    blockchain_site: Array.isArray(data.explorer_url) ? data.explorer_url : (data.explorer_url ? [data.explorer_url] : null),
    chat_url: Array.isArray(data.telegram) ? data.telegram : (data.telegram ? [data.telegram] : null),
    twitter_screen_name: data.twitter || null,
    coingecko_id: null,
    coin_id: data.mint || null,
    official_forum_url: null,
    announcement_url: null
  };
}