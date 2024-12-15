import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  const timeout = 10000;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} - Fetching URL: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) return response;

      if (response.status === 429) {
        console.warn('Rate limit hit. Waiting before retry...');
        await new Promise((res) => setTimeout(res, 5000));
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const contractAddress = requestData.contractAddress;
    console.log('Contract address from request:', contractAddress);

    if (!contractAddress) {
      console.error('Missing contract address in request');
      return new Response(
        JSON.stringify({ error: 'Token address is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate Solana address format
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(contractAddress)) {
      console.error('Invalid Solana contract address:', contractAddress);
      return new Response(
        JSON.stringify({ error: 'Invalid Solana address format', contractAddress }),
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

    // Fetch token metadata
    const solscanMetaURL = `https://pro-api.solscan.io/v1/token/meta?address=${contractAddress}`;
    console.log('Fetching token metadata from Solscan:', solscanMetaURL);

    const metadataResponse = await fetchWithRetry(solscanMetaURL, { headers });
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error(`Solscan Metadata API Error: ${metadataResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({
          error: `Token not found or unsupported (${metadataResponse.status})`,
          details: errorText,
          contractAddress,
        }),
        { headers: corsHeaders, status: metadataResponse.status }
      );
    }

    const metadataResult = await metadataResponse.json();
    console.log('Metadata Result:', metadataResult);

    if (!metadataResult?.data) {
      throw new Error('Token metadata is empty or invalid.');
    }

    // Fetch market data
    const marketResponse = await fetchWithRetry(
      `https://pro-api.solscan.io/v1/token/market?address=${contractAddress}`,
      { headers }
    );

    if (!marketResponse.ok) {
      const errorText = await marketResponse.text();
      console.error(`Solscan Market API Error: ${marketResponse.status} - ${errorText}`);
      throw new Error(`Market data fetch failed (${marketResponse.status})`);
    }

    const marketData = await marketResponse.json();
    console.log('Market Data Result:', marketData);

    if (!marketData?.data) {
      throw new Error('Market data is empty or invalid');
    }

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Process and combine the data
    const metadata = {
      name: metadataResult.data.name || `Unknown Token (${contractAddress.slice(0, 6)}...)`,
      symbol: metadataResult.data.symbol || 'UNKNOWN',
      decimals: metadataResult.data.decimals ?? 9,
      image: metadataResult.data.icon || null,
      description: metadataResult.data.description || null,
      supply: {
        total: metadataResult.data.supply?.total || null,
        circulating: metadataResult.data.supply?.circulating || null,
      },
      price: marketData.data.priceUsdt || null,
      marketCap: marketData.data.marketCapFD || null,
      volume24h: marketData.data.volume24h || null,
      liquidity: marketData.data.liquidity || null,
      change24h: marketData.data.priceChange24h || null
    };

    // Update Supabase database
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert({
        id: contractAddress,
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