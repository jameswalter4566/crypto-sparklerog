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

    // Get Helius API key
    const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY')
    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY is not set')
    }

    console.log('Fetching token metadata from Helius API')
    
    // Test both v0 and v1 endpoints for metadata
    const v1MetadataUrl = `https://api.helius.xyz/v1/token-metadata?api-key=${HELIUS_API_KEY}&tokenAddress=${address}`
    const v0MetadataUrl = `https://api.helius.xyz/v0/token-metadata/${address}?api-key=${HELIUS_API_KEY}`
    
    console.log('Trying v1 endpoint...')
    const v1Response = await fetchWithRetry(v1MetadataUrl)
    const v1Data = await v1Response.json()
    console.log('V1 Metadata response:', JSON.stringify(v1Data, null, 2))
    
    console.log('Trying v0 endpoint...')
    const v0Response = await fetchWithRetry(v0MetadataUrl)
    const v0Data = await v0Response.json()
    console.log('V0 Metadata response:', JSON.stringify(v0Data, null, 2))

    // Try DAS endpoint for market data
    console.log('Fetching DAS market data')
    const dasUrl = `https://api.helius.xyz/v0/token-metadata/DAS/${address}?api-key=${HELIUS_API_KEY}`
    const dasResponse = await fetchWithRetry(dasUrl)
    const dasData = await dasResponse.json()
    console.log('DAS response:', JSON.stringify(dasData, null, 2))

    // Extract metadata prioritizing v1 over v0 response
    const metadata = {
      name: v1Data?.onChainMetadata?.metadata?.name || 
            v1Data?.offChainMetadata?.metadata?.name ||
            v0Data?.name || 
            `Unknown Token (${address.slice(0, 6)}...)`,
      symbol: v1Data?.onChainMetadata?.metadata?.symbol || 
              v0Data?.symbol || 
              'UNKNOWN',
      decimals: v1Data?.onChainMetadata?.metadata?.decimals || 
                v0Data?.decimals || 
                9,
      image: v1Data?.offChainMetadata?.metadata?.image || 
             v1Data?.onChainMetadata?.metadata?.uri ||
             v0Data?.image ||
             null,
      description: v1Data?.offChainMetadata?.metadata?.description || 
                   v0Data?.description ||
                   null,
      tokenStandard: v1Data?.onChainMetadata?.tokenStandard || 
                     v0Data?.tokenStandard ||
                     null,
      // Market data from DAS
      price: dasData?.price || null,
      marketCap: dasData?.marketCap || null,
      volume24h: dasData?.volume24h || null,
      liquidity: dasData?.liquidity || null,
      change24h: dasData?.priceChange24h || null
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