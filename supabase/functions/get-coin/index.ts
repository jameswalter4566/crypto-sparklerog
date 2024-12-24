/**
 * Supabase Edge Function: get-coin
 * 
 * This function fetches a list of coins from Pump.fun via the custom fetchFromPumpApi utility,
 * then finds the matching token by its 'mint' address. Finally, it maps that token data using
 * the coin-mapper utility and returns the final CoinData to the caller.
 */

import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { fetchFromPumpApi } from '../_shared/pump-api.ts';
import { mapPumpApiToCoinData } from '../_shared/coin-mapper.ts';

serve(async (req: Request) => {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenAddress = url.searchParams.get('id');
    
    if (!tokenAddress) {
      console.error('No token id provided');
      return new Response(
        JSON.stringify({ error: 'No token id provided' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Fetching data for token: ${tokenAddress}`);
    
    const searchData = await fetchFromPumpApi('/coins', {
      searchTerm: tokenAddress,
      limit: 50,
      sort: 'market_cap',
      order: 'DESC',
      includeNsfw: false
    });

    if (!searchData || !Array.isArray(searchData)) {
      console.error('Invalid response from Pump.fun:', searchData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from Pump.fun' }), 
        { status: 500, headers: corsHeaders }
      );
    }

    const matchingToken = searchData.find(
      (item) => item.mint?.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (!matchingToken) {
      console.error('Token not found on Pump.fun');
      return new Response(
        JSON.stringify({ error: 'Token not found on Pump.fun' }), 
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('Found matching token:', {
      mint: matchingToken.mint,
      market_cap: matchingToken.market_cap,
      usd_market_cap: matchingToken.usd_market_cap
    });

    const mappedData = mapPumpApiToCoinData(matchingToken);

    // Add cache control headers to prevent caching
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    return new Response(JSON.stringify(mappedData), { headers: responseHeaders });

  } catch (error) {
    console.error('Error in get-coin function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
});