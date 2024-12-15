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

    // Get Alchemy API key
    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY')
    if (!ALCHEMY_API_KEY) {
      throw new Error('ALCHEMY_API_KEY is not set')
    }

    // Initialize Solana connection using Alchemy endpoint
    const connection = new web3.Connection(
      `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      'confirmed'
    );

    console.log('Fetching token metadata for:', address)
    
    // Get token supply and other on-chain information
    try {
      const tokenMint = new web3.PublicKey(address);
      const tokenSupply = await connection.getTokenSupply(tokenMint);
      console.log('Token supply:', tokenSupply);
    } catch (error) {
      console.error('Error fetching token supply:', error);
    }

    // Fetch token metadata using Alchemy's Enhanced API
    const metadataResponse = await fetch(
      `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "alchemy_getTokenMetadata",
          params: {
            mint: address
          }
        })
      }
    );

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text()
      console.error('Failed to fetch token metadata:', errorText)
      throw new Error(`Failed to fetch token metadata: ${errorText}`)
    }

    const metadataResult = await metadataResponse.json()
    console.log('Token metadata response:', JSON.stringify(metadataResult, null, 2))

    // Extract token metadata from the response
    const tokenMetadata = {
      name: metadataResult.result?.name || "Unknown Token",
      symbol: metadataResult.result?.symbol || "???",
      image: metadataResult.result?.logo || null,
      decimals: metadataResult.result?.decimals
    }

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
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        image_url: tokenMetadata.image,
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
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        image: tokenMetadata.image,
        decimals: tokenMetadata.decimals,
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