import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validate Solana address format
const isValidSolanaAddress = (address: string): boolean => {
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
};

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
      
      if (!response.ok) {
        console.log(`Attempt ${i + 1} failed with status: ${response.status}`);
        const errorText = await response.text();
        console.log(`Error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Successful response from ${url}`);
      return data;
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
    
    // Validate input
    if (!address) {
      throw new Error('Token address is required');
    }

    if (!isValidSolanaAddress(address)) {
      throw new Error('Invalid Solana token address format');
    }

    console.log('Processing request for token address:', address);

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const SOLSCAN_API_KEY = Deno.env.get('SOLSCAN_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SOLSCAN_API_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Common headers for Solscan Pro API
    const headers = {
      'token': SOLSCAN_API_KEY,
      'accept': 'application/json',
    };

    // Fetch token metadata from Solscan Pro API
    console.log('Fetching token metadata from Solscan Pro API');
    const metadataResult = await fetchWithRetry(
      `https://pro-api.solscan.io/v1/token/meta?address=${address}`,
      { headers }
    );
    
    if (!metadataResult?.data) {
      throw new Error('Invalid metadata response from Solscan API');
    }
    
    console.log('Metadata response:', JSON.stringify(metadataResult, null, 2));

    // Fetch market data from Solscan Pro API
    console.log('Fetching market data from Solscan Pro API');
    const marketData = await fetchWithRetry(
      `https://pro-api.solscan.io/v1/token/market?address=${address}`,
      { headers }
    );
    
    if (!marketData?.data) {
      throw new Error('Invalid market data response from Solscan API');
    }
    
    console.log('Market data response:', JSON.stringify(marketData, null, 2));

    // Process and combine the data with fallback values
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

    console.log('Final processed metadata:', metadata);

    // Update Supabase database with null-safe values
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert({
        id: address,
        name: metadata.name,
        symbol: metadata.symbol,
        image_url: metadata.image,
        price: metadata.price,
        change_24h: metadata.change24h,
        market_cap: metadata.marketCap,
        volume_24h: metadata.volume24h,
        liquidity: metadata.liquidity,
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
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
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
      },
    );
  }
});