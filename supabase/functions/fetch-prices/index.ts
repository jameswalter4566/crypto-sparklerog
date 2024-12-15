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
        includeOffChain: true, // This ensures we get both on-chain and off-chain metadata
        disableCache: false    // Set to true if you need real-time data
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

    // Fetch supply information
    console.log('Fetching supply information from Helius')
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

    // For demonstration, using mock data since we don't have real-time price data
    const mockData = {
      price: Math.random() * 100,
      change_24h: (Math.random() * 20) - 10,
      market_cap: Math.random() * 1000000,
      volume_24h: Math.random() * 500000,
      liquidity: Math.random() * 200000
    }

    // Extract comprehensive metadata
    const metadata = {
      name: tokenMetadata.onChainMetadata?.metadata?.name || `Token ${address.slice(0, 6)}...`,
      symbol: tokenMetadata.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
      decimals: tokenMetadata.onChainMetadata?.metadata?.decimals || 9,
      image: tokenMetadata.onChainMetadata?.metadata?.uri || null,
      description: tokenMetadata.offChainMetadata?.metadata?.description || null,
      externalUrl: tokenMetadata.offChainMetadata?.metadata?.external_url || null,
      attributes: tokenMetadata.offChainMetadata?.metadata?.attributes || [],
      tokenStandard: tokenMetadata.onChainMetadata?.tokenStandard || null,
      creators: tokenMetadata.onChainMetadata?.metadata?.creators || [],
      collection: tokenMetadata.offChainMetadata?.metadata?.collection || null,
      uses: tokenMetadata.onChainMetadata?.metadata?.uses || null,
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
        price: mockData.price,
        change_24h: mockData.change_24h,
        market_cap: mockData.market_cap,
        volume_24h: mockData.volume_24h,
        liquidity: mockData.liquidity,
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
      JSON.stringify({
        ...metadata,
        price: mockData.price,
        change_24h: mockData.change_24h,
        market_cap: mockData.market_cap,
        volume_24h: mockData.volume_24h,
        liquidity: mockData.liquidity,
        supply: supplyData.result.value
      }),
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