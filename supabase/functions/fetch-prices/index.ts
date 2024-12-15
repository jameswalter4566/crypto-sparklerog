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

    // Fetch token metadata from Alchemy using the token API endpoint
    console.log('Fetching metadata from Alchemy...')
    const metadataResponse = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getContractMetadata`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: address
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

    const metadata = {
      name: metadataResult.name || "Unknown Token",
      symbol: metadataResult.symbol || "UNKNOWN",
      logo: metadataResult.openSea?.imageUrl || null,
      decimals: metadataResult.tokenType === 'ERC20' ? 18 : 0
    }

    // Fetch token price from Alchemy's token API
    console.log('Fetching price data from Alchemy...')
    const priceResponse = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getFloorPrice`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text()
      console.error('Price fetch failed:', errorText)
      throw new Error(`Failed to fetch token price: ${errorText}`)
    }

    const priceData = await priceResponse.json()
    console.log('Price response:', priceData)

    const price = priceData.openSea?.floorPrice || null

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
        name: metadata.name,
        symbol: metadata.symbol,
        image_url: metadata.logo,
        price: price,
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
        name: metadata.name,
        symbol: metadata.symbol,
        image: metadata.logo,
        decimals: metadata.decimals,
        price: price
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