import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Fetching token metadata from Helius v1 API for:', address)
    
    // Fetch token metadata using v1 API
    const metadataResponse = await fetch(`https://api.helius.xyz/v1/token-metadata?api-key=${HELIUS_API_KEY}&tokenAddress=${address}`);

    if (!metadataResponse.ok) {
      throw new Error(`Helius metadata API error: ${metadataResponse.statusText}`)
    }

    const metadataResult = await metadataResponse.json()
    console.log('Received metadata from v1 API:', metadataResult)

    // Fetch market data using DAS API
    console.log('Fetching market data from DAS API')
    const dasResponse = await fetch(`https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${HELIUS_API_KEY}`);

    if (!dasResponse.ok) {
      throw new Error(`DAS API error: ${dasResponse.statusText}`)
    }

    const dasData = await dasResponse.json()
    console.log('Received DAS data:', dasData)

    // Fetch supply information using RPC
    console.log('Fetching supply information')
    const supplyResponse = await fetch(`https://api.helius.xyz/v0/addresses/${address}/native-balance?api-key=${HELIUS_API_KEY}`);

    if (!supplyResponse.ok) {
      throw new Error(`Supply API error: ${supplyResponse.statusText}`)
    }

    const supplyData = await supplyResponse.json()
    console.log('Received supply data:', supplyData)

    // Extract and format token data
    const metadata = {
      name: metadataResult?.onChainMetadata?.metadata?.name || metadataResult?.offChainMetadata?.metadata?.name || `Token ${address.slice(0, 6)}...`,
      symbol: metadataResult?.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
      decimals: metadataResult?.onChainMetadata?.metadata?.decimals || 9,
      image: metadataResult?.offChainMetadata?.metadata?.image || metadataResult?.onChainMetadata?.metadata?.uri || null,
      description: metadataResult?.offChainMetadata?.metadata?.description || null,
      tokenStandard: metadataResult?.onChainMetadata?.tokenStandard || null,
      supply: {
        total: supplyData?.nativeBalance || null,
        circulating: supplyData?.nativeBalance || null,
        nonCirculating: 0
      },
      // Market data from DAS
      price: dasData?.tokens?.[0]?.price || null,
      marketCap: dasData?.tokens?.[0]?.marketCap || null,
      volume24h: dasData?.tokens?.[0]?.volume24h || null,
      liquidity: dasData?.tokens?.[0]?.liquidity || null,
      change24h: dasData?.tokens?.[0]?.priceChange24h || null
    }

    // Update Supabase database
    console.log('Updating Supabase database with token data')
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

    console.log('Successfully processed token data')
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