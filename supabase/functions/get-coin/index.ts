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

    // 1) Get the 'id' param, which is the token address (mint)
    const tokenAddress = url.searchParams.get('id');
    if (!tokenAddress) {
      return new Response(JSON.stringify({ error: 'No token id provided' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 2) Potentially get a captcha token or other query params if needed
    const captchaToken = url.searchParams.get('captchaToken') || '';

    // 3) Fetch coins from Pump.fun
    console.log('Fetching from Pump.fun URL: https://frontend-api-v2.pump.fun/coins');
    const searchData = await fetchFromPumpApi('/coins', {
      searchTerm: tokenAddress,
      limit: 50,
      sort: 'market_cap',
      order: 'DESC',
      includeNsfw: false,
      captchaToken
    });

    if (!searchData || !Array.isArray(searchData)) {
      return new Response(JSON.stringify({ error: 'Invalid response from Pump.fun' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // 4) Find the matching token
    const matchingToken = searchData.find(
      (item) => item.mint?.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (!matchingToken) {
      return new Response(JSON.stringify({ error: 'Token not found on Pump.fun' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // 5) Map the raw Pump.fun data to your CoinData structure
    const mappedData = mapPumpApiToCoinData(matchingToken);

    // 6) Return final mapped coin data
    return new Response(JSON.stringify(mappedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-coin function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
