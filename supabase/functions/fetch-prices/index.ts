import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body if it exists
    let body = {}
    if (req.body) {
      const reader = req.body.getReader()
      const decoder = new TextDecoder()
      const chunk = await reader.read()
      const text = decoder.decode(chunk.value)
      if (text) {
        body = JSON.parse(text)
      }
    }

    // If address is provided in the body, fetch specific coin data
    if (body.address) {
      // Here you would implement the logic to fetch specific coin data
      // For now, returning a mock response
      const coinData = {
        id: body.address,
        name: "Test Coin",
        symbol: "TEST",
        price: 1.0,
        change_24h: 0,
        market_cap: 1000000,
        volume_24h: 100000,
        liquidity: 50000
      }
      
      return new Response(
        JSON.stringify({ data: [coinData] }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // Otherwise fetch all prices from Jupiter
    console.log('Fetching prices from Jupiter API...')
    const response = await fetch('https://price.jup.ag/v4/price', {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Jupiter API response not OK:', response.status, response.statusText)
      throw new Error(`Jupiter API responded with status ${response.status}`)
    }

    const data = await response.json()
    console.log('Successfully fetched Jupiter prices')

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
