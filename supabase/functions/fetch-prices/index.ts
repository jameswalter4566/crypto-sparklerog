import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as web3 from 'npm:@solana/web3.js'

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

    console.log('Fetching token information from Helius for:', address)
    
    // Fetch detailed token metadata from Helius
    const heliusResponse = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mintAccounts: [address],
        includeOffChain: true,
        disableCache: false
      })
    });

    if (!heliusResponse.ok) {
      throw new Error(`Helius API error: ${heliusResponse.statusText}`)
    }

    const heliusData = await heliusResponse.json()
    console.log('Received Helius data:', heliusData)

    if (!heliusData.length || !heliusData[0]) {
      throw new Error('No token metadata found')
    }

    const tokenMetadata = heliusData[0]

    // Fetch DAS (Digital Asset Standard) data which includes price and market data
    const dasResponse = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mintAccounts: [address],
        includeOffChain: true,
        disableCache: false
      })
    });

    if (!dasResponse.ok) {
      throw new Error(`DAS API error: ${dasResponse.statusText}`)
    }

    const dasData = await dasResponse.json()
    console.log('Received DAS data:', dasData)

    // Fetch supply information
    const supplyResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSupply',
        params: [{
          commitment: 'finalized',
          excludeNonCirculatingAccountsList: true
        }]
      })
    });

    if (!supplyResponse.ok) {
      throw new Error(`Supply API error: ${supplyResponse.statusText}`)
    }

    const supplyData = await supplyResponse.json()
    console.log('Received supply data:', supplyData)

    // Extract token data from responses
    const metadata = {
      name: tokenMetadata.onChainMetadata?.metadata?.name || tokenMetadata.offChainMetadata?.metadata?.name || `Token ${address.slice(0, 6)}...`,
      symbol: tokenMetadata.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
      decimals: tokenMetadata.onChainMetadata?.metadata?.decimals || 9,
      image: tokenMetadata.offChainMetadata?.metadata?.image || tokenMetadata.onChainMetadata?.metadata?.uri || null,
      description: tokenMetadata.offChainMetadata?.metadata?.description || null,
      tokenStandard: tokenMetadata.onChainMetadata?.tokenStandard || null,
      supply: supplyData.result?.value || null,
      // Extract market data from DAS response
      price: dasData[0]?.price || null,
      marketCap: dasData[0]?.marketCap || null,
      volume24h: dasData[0]?.volume24h || null,
      liquidity: dasData[0]?.liquidity || null,
      change24h: dasData[0]?.priceChange24h || null
    }

    // Update the token data in Supabase
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