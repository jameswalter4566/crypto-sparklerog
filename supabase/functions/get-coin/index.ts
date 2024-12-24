/**
 * This function is invoked via a Supabase Function call to fetch a single coin's data by ID.
 * It uses fetchFromPumpApi() to query the Pump.fun API, then returns the mapped data.
 */

import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { fetchFromPumpApi } from '../_shared/pump-api.ts';
import { mapPumpApiToCoinData } from '../_shared/coin-mapper.ts';

serve(async (req: Request) => {
  // Allow cross-origin requests
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenAddress = url.searchParams.get('id');
    if (!tokenAddress) {
      return new Response(JSON.stringify({ error: 'No token id provided' }), { status: 400, headers: corsHeaders });
    }

    // Example: This might come from your request, if you have a captcha or other info
    const captchaToken = url.searchParams.get('captchaToken') || '';

    // 1) Fetch possible matches from Pump.fun
    console.log('Fetching from Pump.fun with tokenAddress:', tokenAddress);
    const searchData = await fetchFromPumpApi('/coins', {
      searchTerm: tokenAddress,
      limit: 50,
      sort: 'market_cap',
      order: 'DESC',
      includeNsfw: false,
      captchaToken
    });

    if (!searchData || !Array.isArray(searchData)) {
      return new Response(JSON.stringify({ error: 'Invalid response from Pump.fun' }), { status: 500, headers: corsHeaders });
    }

    // 2) Find the exact matching token by mint
    const matchingToken = searchData.find(
      (item) => item.mint?.toLowerCase() === tokenAddress.toLowerCase()
    );

    // If no matching token found
    if (!matchingToken) {
      return new Response(JSON.stringify({ error: 'Token not found on Pump.fun' }), { status: 404, headers: corsHeaders });
    }

    // 3) Map the raw Pump.fun data to your CoinData shape
    const mappedData = mapPumpApiToCoinData(matchingToken);

    // Return the final mapped coin data
    return new Response(JSON.stringify(mappedData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in get-coin function:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
