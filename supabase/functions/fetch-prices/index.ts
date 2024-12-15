import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address } = await req.json()
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing request for address:', address)

    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY')
    if (!ALCHEMY_API_KEY) {
      throw new Error('ALCHEMY_API_KEY is not set')
    }

    // Fetch token metadata from Alchemy
    console.log('Fetching metadata from Alchemy...')
    const metadataResponse = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [address],
          id: 1
        })
      }
    )

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text()
      console.error('Metadata fetch failed:', errorText)
      throw new Error(`Failed to fetch token metadata: ${errorText}`)
    }

    const metadataResult = await metadataResponse.json()
    console.log('Metadata response:', metadataResult)

    const metadata = metadataResult.result || {}

    // Fetch token price from Alchemy
    console.log('Fetching price data from Alchemy...')
    const priceResponse = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getTokenMetadata`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          addresses: [{
            network: 'eth-mainnet',
            address: address
          }]
        })
      }
    )

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text()
      console.error('Price fetch failed:', errorText)
      throw new Error(`Failed to fetch token price: ${errorText}`)
    }

    const priceData = await priceResponse.json()
    console.log('Price response:', priceData)

    const tokenData = priceData.data?.[0] || {}
    const price = tokenData.prices?.[0]?.value || null

    // Update the token data in Supabase
    console.log('Updating Supabase database...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: upsertError } = await supabaseClient
      .from('coins')
      .upsert({
        id: address,
        name: metadata.name || "Unknown Token",
        symbol: metadata.symbol || "UNKNOWN",
        image_url: metadata.logo || null,
        price: price ? parseFloat(price) : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('Database update failed:', upsertError)
      throw upsertError
    }

    console.log('Successfully processed token data')
    return new Response(
      JSON.stringify({
        name: metadata.name || "Unknown Token",
        symbol: metadata.symbol || "UNKNOWN",
        image: metadata.logo || null,
        decimals: metadata.decimals,
        price: price ? parseFloat(price) : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in fetch-prices function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch token data',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})