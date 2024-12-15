import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      console.log(`Attempt ${i + 1} failed with status: ${response.status}`);
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, i)));
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
    const { address } = await req.json()
    if (!address) {
      throw new Error('Token address is required')
    }

    console.log('Processing request for token address:', address)

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Fetch token metadata from Solscan
    console.log('Fetching token metadata from Solscan API')
    const metadataUrl = `https://public-api.solscan.io/token/meta?tokenAddress=${address}`
    const metadataResponse = await fetchWithRetry(metadataUrl)
    const metadataResult = await metadataResponse.json()
    console.log('Metadata response:', JSON.stringify(metadataResult, null, 2))

    // Fetch market data from Solscan
    console.log('Fetching market data from Solscan API')
    const marketUrl = `https://public-api.solscan.io/market?tokenAddress=${address}`
    const marketResponse = await fetchWithRetry(marketUrl)
    const marketData = await marketResponse.json()
    console.log('Market data response:', JSON.stringify(marketData, null, 2))

    // Process and combine the data
    const metadata = {
      name: metadataResult?.symbol || `Unknown Token (${address.slice(0, 6)}...)`,
      symbol: metadataResult?.symbol || 'UNKNOWN',
      decimals: metadataResult?.decimals || 9,
      image: metadataResult?.icon || null,
      description: metadataResult?.description || null,
      tokenStandard: 'SPL Token',
      price: marketData?.priceUsdt || null,
      marketCap: marketData?.marketCapFD || null,
      volume24h: marketData?.volume24h || null,
      liquidity: marketData?.liquidity || null,
      change24h: marketData?.priceChange24h || null
    }

    console.log('Final processed metadata:', metadata)

    // Update Supabase database
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
      })

    if (upsertError) {
      console.error('Failed to update database:', upsertError)
      throw upsertError
    }

    return new Response(
      JSON.stringify(metadata),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})