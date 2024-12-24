/**
 * coin-mapper.ts
 * Maps a PumpApiResponse object to our internal CoinData format,
 * including any fields needed for the front-end or the database.
 */

import { PumpApiResponse, CoinData } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  // Detailed logging of incoming data
  console.log('Raw API data received:', {
    mint: data.mint,
    name: data.name,
    market_cap: data.market_cap,
    usd_market_cap: data.usd_market_cap,
    virtual_sol_reserves: data.virtual_sol_reserves,
    virtual_token_reserves: data.virtual_token_reserves
  });

  // Safely parse numeric fields with explicit type checking
  const safeMarketCap = typeof data.market_cap === 'number' && !isNaN(data.market_cap) 
    ? data.market_cap 
    : null;
    
  const safeUsdMarketCap = typeof data.usd_market_cap === 'number' && !isNaN(data.usd_market_cap)
    ? data.usd_market_cap
    : null;

  const mappedData: CoinData = {
    // The unique identifier
    id: data.mint,

    // Basic info
    name: data.name,
    symbol: data.symbol,
    description: data.description,
    image_url: data.image_uri,
    video_uri: data.video_uri || null,
    metadata_uri: data.metadata_uri || null,
    twitter_screen_name: data.twitter || null,
    telegram: data.telegram || null,
    bonding_curve: data.bonding_curve || null,
    associated_bonding_curve: data.associated_bonding_curve || null,
    creator: data.creator || null,
    created_timestamp: data.created_timestamp || null,
    raydium_pool: data.raydium_pool || null,
    complete: data.complete || false,
    virtual_sol_reserves: data.virtual_sol_reserves || null,
    virtual_token_reserves: data.virtual_token_reserves || null,
    total_supply: data.total_supply || null,
    website: data.website || null,
    show_name: data.show_name || null,
    king_of_the_hill_timestamp: data.king_of_the_hill_timestamp || null,
    reply_count: data.reply_count || null,
    last_reply: data.last_reply || null,
    nsfw: data.nsfw || false,
    market_id: data.market_id || null,
    inverted: data.inverted || null,
    is_currently_live: data.is_currently_live || false,
    username: data.username || null,
    profile_image: data.profile_image || null,

    // Market caps - using our safely parsed values
    market_cap: safeMarketCap,
    usd_market_cap: safeUsdMarketCap,

    // Additional fields with proper null handling
    price: null,
    change_24h: null,
    volume_24h: null,
    liquidity: null,
    circulating_supply: null,
    decimals: null,
    homepage: data.website || null,
    blockchain_site: [],
    chat_url: data.telegram ? [data.telegram] : [],
    coingecko_id: null,
    non_circulating_supply: null,
    announcement_url: null,
    official_forum_url: null,

    // Timestamps
    updated_at: new Date().toISOString(),
    solana_addr: data.mint,

    // Historic data
    historic_data: null
  };

  // Log the final mapped data for debugging
  console.log('Final mapped coin data:', {
    id: mappedData.id,
    market_cap: mappedData.market_cap,
    usd_market_cap: mappedData.usd_market_cap
  });

  return mappedData;
}