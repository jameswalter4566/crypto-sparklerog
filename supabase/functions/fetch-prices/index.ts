import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address } = await req.json()
    console.log('Fetching price data for address:', address)

    // If no address provided, fetch all prices
    let jupiterUrl = 'https://price.jup.ag/v4/price'
    if (address) {
      jupiterUrl += `?ids=${address}`
    }

    console.log('Making request to Jupiter API:', jupiterUrl)
    
    const response = await fetch(jupiterUrl, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Jupiter API error:', response.status, response.statusText, errorText)
      throw new Error(`Jupiter API responded with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched Jupiter data:', data)

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
        error: error.message || 'An error occurred while fetching prices'
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