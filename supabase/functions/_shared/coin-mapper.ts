import { CoinData, PumpApiResponse } from './types.ts';

export function mapPumpApiToCoinData(data: PumpApiResponse): CoinData {
  // Log the complete raw API response
  console.log('Raw Pump.fun API Response:', JSON.stringify(data, null, 2));
  
  // Calculate price in SOL using virtual reserves
  let priceInSol: number | null = null;
  if (data.virtual_sol_reserves && data.virtual_token_reserves) {
    const solAmount = data.virtual_sol_reserves / 1e9; // Convert lamports to SOL
    const tokenAmount = data.virtual_token_reserves / 1e9; // Assuming 9 decimals
    priceInSol = solAmount / tokenAmount;
    console.log('Calculated price in SOL:', priceInSol);
  }

  // Calculate liquidity in SOL
  const liquidityInSol = data.virtual_sol_reserves
    ? data.virtual_sol_reserves / 1e9 // Convert lamports to SOL
    : null;
  console.log('Calculated liquidity in SOL:', liquidityInSol);

  // Ensure market cap values are numbers and not null
  const marketCap = typeof data.market_cap === 'number' ? data.market_cap : null;
  const usdMarketCap = typeof data.usd_market_cap === 'number' ? data.usd_market_cap : null;

  console.log('Market caps before mapping:', {
    marketCap,
    usdMarketCap
  });

  const mappedData: CoinData = {
    id: data.mint,
    name: data.name,
    symbol: data.symbol,
    price: priceInSol,
    change_24h: null,
    market_cap: marketCap,
    usd_market_cap: usdMarketCap,
    volume_24h: null,
    liquidity: liquidityInSol,
    total_supply: data.total_supply ? data.total_supply / 1e9 : null,
    description: data.description,
    image_url: data.image_uri,
    solana_addr: data.mint,
    homepage: data.website || null,
    blockchain_site: null,
    official_forum_url: null,
    chat_url: data.telegram ? [data.telegram] : null,
    announcement_url: null,
    twitter_screen_name: data.twitter?.replace('https://x.com/', '') || null,
    historic_data: null
  };

  // Log the final mapped data
  console.log('Final mapped coin data:', JSON.stringify(mappedData, null, 2));
  
  return mappedData;
}