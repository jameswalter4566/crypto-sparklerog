import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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

    // First, get the token metadata using the Enhanced API with GET method
    console.log('Fetching token metadata for:', address)
    const metadataUrl = new URL(`https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/enhanced/getTokenMetadata`)
    metadataUrl.searchParams.append('contractAddresses', address)
    
    const metadataResponse = await fetch(metadataUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text()
      console.error('Failed to fetch metadata:', errorText)
      throw new Error(`Failed to fetch token metadata: ${errorText}`)
    }

    const metadataResult = await metadataResponse.json()
    console.log('Raw metadata response:', JSON.stringify(metadataResult, null, 2))

    if (!metadataResult.tokens || !metadataResult.tokens[0]) {
      console.error('No metadata found in response:', metadataResult)
      throw new Error('No metadata found for token')
    }

    const tokenMetadata = metadataResult.tokens[0]
    console.log('Parsed token metadata:', tokenMetadata)

    const metadata = {
      name: tokenMetadata.name || "Unknown Token",
      symbol: tokenMetadata.symbol || "???",
      logo: tokenMetadata.logo || null,
      decimals: tokenMetadata.decimals || 9
    }

    // For demonstration, using a mock price
    const price = 1.0 // Mock price in USD

    // Update the token data in Supabase
    console.log('Updating Supabase database with token data:', metadata)
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