import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the token address from the request body
    const { address } = await req.json()
    if (!address) {
      throw new Error('Token address is required')
    }

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Get Alchemy API key from environment variables
    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY')
    if (!ALCHEMY_API_KEY) {
      throw new Error('ALCHEMY_API_KEY is not set')
    }

    // Fetch token metadata from Solana network
    console.log('Fetching metadata from Solana network...')
    const metadataResponse = await fetch(
      `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenSupply',
          params: [address]
        })
      }
    )

    if (!metadataResponse.ok) {
      console.error('Failed to fetch metadata:', await metadataResponse.text())
      throw new Error('Failed to fetch token metadata')
    }

    const metadataResult = await metadataResponse.json()
    console.log('Metadata response:', metadataResult)

    // For now, we'll use a simplified metadata structure
    const metadata = {
      name: "Solana Token",
      symbol: "SOL",
      logo: null,
      decimals: 9 // Default for Solana tokens
    }

    // Fetch token account balance as a proxy for price data
    console.log('Fetching token data...')
    const tokenResponse = await fetch(
      `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            {
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            },
            {
              encoding: "jsonParsed"
            }
          ]
        })
      }
    )

    if (!tokenResponse.ok) {
      console.error('Failed to fetch token data:', await tokenResponse.text())
      throw new Error('Failed to fetch token data')
    }

    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData)

    // For demonstration, we'll use a mock price
    const price = 1.0 // Mock price in USD

    // Update the token data in Supabase
    console.log('Updating Supabase database...')
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert({
        id: address,
        name: metadata.name,
        symbol: metadata.symbol,
        image_url: metadata.logo,
        price: price,
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
        name: metadata.name,
        symbol: metadata.symbol,
        image: metadata.logo,
        decimals: metadata.decimals,
        price: price
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