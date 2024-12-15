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
    
    // Fetch token metadata from Helius
    const heliusResponse = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mintAccounts: [address],
        includeOffChain: true,
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

    // For demonstration, using mock data since we don't have real-time price data
    const mockData = {
      price: Math.random() * 100,
      change_24h: (Math.random() * 20) - 10,
      market_cap: Math.random() * 1000000,
      volume_24h: Math.random() * 500000,
      liquidity: Math.random() * 200000
    }

    // Update the token data in Supabase
    console.log('Updating Supabase database with token data')
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert({
        id: address,
        name: tokenMetadata.onChainMetadata?.metadata?.name || `Token ${address.slice(0, 6)}...`,
        symbol: tokenMetadata.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
        image_url: tokenMetadata.onChainMetadata?.metadata?.uri || null,
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
        name: tokenMetadata.onChainMetadata?.metadata?.name || `Token ${address.slice(0, 6)}...`,
        symbol: tokenMetadata.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
        image: tokenMetadata.onChainMetadata?.metadata?.uri || null,
        price: mockData.price,
        change_24h: mockData.change_24h,
        market_cap: mockData.market_cap,
        volume_24h: mockData.volume_24h,
        liquidity: mockData.liquidity
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