import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  const timeout = 10000; // 10 seconds timeout
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} - Fetching URL: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn('Rate limit hit. Waiting before retry...');
        await new Promise((res) => setTimeout(res, 5000)); // Wait 5 seconds
        continue;
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed with error:`, error);
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Token address is required' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log('Processing request for token address:', address);

    // Validate Solana address format
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(address)) {
      console.error('Invalid Solana token address:', address);
      return new Response(
        JSON.stringify({ error: 'Invalid Solana address format', address }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const SOLSCAN_API_KEY = Deno.env.get('SOLSCAN_API_KEY');
    if (!SOLSCAN_API_KEY) {
      throw new Error('Missing SOLSCAN_API_KEY environment variable');
    }

    const headers = {
      'token': SOLSCAN_API_KEY,
      'accept': 'application/json',
    };

    // Fetch token metadata from Solscan Pro API
    const solscanMetaURL = `https://pro-api.solscan.io/v1/token/meta?address=${address}`;
    console.log('Fetching Solscan metadata with URL:', solscanMetaURL);

    const metadataResponse = await fetchWithRetry(solscanMetaURL, { headers });
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error(`Solscan API Error ${metadataResponse.status}: ${errorText}`);

      return new Response(
        JSON.stringify({
          error: `Solscan API returned ${metadataResponse.status}`,
          details: errorText,
          address,
        }),
        { headers: corsHeaders, status: metadataResponse.status }
      );
    }

    const metadataResult = await metadataResponse.json();
    console.log('Solscan Metadata Response:', metadataResult);

    if (!metadataResult?.data) {
      throw new Error('Invalid metadata response from Solscan API');
    }

    // Fetch market data from Solscan Pro API
    const marketResponse = await fetchWithRetry(
      `https://pro-api.solscan.io/v1/token/market?address=${address}`,
      { headers }
    );

    if (!marketResponse.ok) {
      const errorText = await marketResponse.text();
      console.error(`Market API Error ${marketResponse.status}: ${errorText}`);
      throw new Error(`Market API returned ${marketResponse.status}: ${errorText}`);
    }

    const marketData = await marketResponse.json();
    console.log('Market data response:', marketData);

    if (!marketData?.data) {
      throw new Error('Invalid market data response from Solscan API');
    }

    // Process and combine the data
    const metadata = {
      name: metadataResult.data.name || `Unknown Token (${address.slice(0, 6)}...)`,
      symbol: metadataResult.data.symbol || 'UNKNOWN',
      decimals: metadataResult.data.decimals ?? 9,
      image: metadataResult.data.icon || null,
      description: metadataResult.data.description || null,
      tokenStandard: 'SPL Token',
      supply: {
        total: metadataResult.data.supply?.total || null,
        circulating: metadataResult.data.supply?.circulating || null,
        nonCirculating: metadataResult.data.supply?.nonCirculating || null,
      },
      price: marketData.data.priceUsdt || null,
      marketCap: marketData.data.marketCapFD || null,
      volume24h: marketData.data.volume24h || null,
      liquidity: marketData.data.liquidity || null,
      change24h: marketData.data.priceChange24h || null
    };

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Update Supabase database
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert({
        id: address,
        name: metadata.name,
        symbol: metadata.symbol,
        image_url: metadata.image,
        price: metadata.price || 0,
        change_24h: metadata.change24h || 0,
        market_cap: metadata.marketCap || 0,
        volume_24h: metadata.volume24h || 0,
        liquidity: metadata.liquidity || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('Failed to update database:', upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify(metadata),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});