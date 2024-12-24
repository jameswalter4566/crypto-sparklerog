/**
 * coin-mapper.ts
 * Maps a PumpApiResponse object to our internal CoinData format,
 * including any fields needed for the front-end or the database.
 */

import { PumpApiResponse, CoinData } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  // Log some raw data
  console.log('Raw API data received:', {
    mint: data.mint,
    name: data.name,
    market_cap: data.market_cap,
    usd_market_cap: data.usd_market_cap,
    virtual_sol_reserves: data.virtual_sol_reserves,
    virtual_token_reserves: data.virtual_token_reserves
  });

  // Safely parse numeric fields
  const safeMarketCap = typeof data.market_cap === 'number' ? data.market_cap : null;
  const safeUsdMarketCap = typeof data.usd_market_cap === 'number' ? data.usd_market_cap : null;

  // Here you can also do other calculations, e.g. priceInSol if you want
  // For example:
  // let priceInSol: number | null = null;
  // if (data.virtual_sol_reserves && data.virtual_token_reserves) {
  //   const solAmount = data.virtual_sol_reserves / 1e9; 
  //   const tokenAmount = data.virtual_token_reserves / 1e9; 
  //   priceInSol = solAmount / tokenAmount;
  //   console.log('Calculated price in SOL:', priceInSol);
  // }

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

    // Market caps
    market_cap: safeMarketCap,
    usd_market_cap: safeUsdMarketCap,

    // If you need price or other fields:
    price: null,
    change_24h: null,
    volume_24h: null,
    liquidity: null, // If you want to store liquidity from virtual_sol_reserves, you can do so
    circulating_supply: null,
    decimals: null,

    // Additional link fields
    homepage: null, // or set data.website if that’s your preference
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

  console.log('Final mapped coin data:', mappedData);
  return mappedData;
}
