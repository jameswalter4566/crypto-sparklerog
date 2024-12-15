import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Fetching token data from Helius for address:', address)

    if (!address) {
      throw new Error('Address is required')
    }

    const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY')
    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY is not set')
    }

    const heliusUrl = `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`
    
    const response = await fetch(heliusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mintAccounts: [address],
        includeOffChain: true,
        disableCache: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Helius API error:', response.status, response.statusText, errorText)
      throw new Error(`Helius API responded with status ${response.status}: ${errorText}`)
    }

    const heliusData = await response.json()
    console.log('Successfully fetched Helius data:', heliusData)

    // Transform Helius data to match our expected format
    const tokenData = heliusData[0] || {}
    const data = {
      name: tokenData.onChainMetadata?.metadata?.name || 'Unknown',
      symbol: tokenData.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
      price: null, // Helius doesn't provide price directly
      image_url: tokenData.offChainMetadata?.metadata?.image || null,
      market_cap: null,
      volume_24h: null,
      liquidity: null,
    }

    return new Response(
      JSON.stringify({ data }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error in fetch-prices function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while fetching token data'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})