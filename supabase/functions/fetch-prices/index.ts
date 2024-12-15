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
    const url = new URL(req.url)
    const address = url.searchParams.get('address')

    // If address is provided, fetch specific coin data
    if (address) {
      // Here you would implement the logic to fetch specific coin data
      // For now, returning a mock response
      const coinData = {
        id: address,
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
    const response = await fetch('https://price.jup.ag/v4/price')
    if (!response.ok) {
      throw new Error('Failed to fetch Jupiter prices')
    }
    const data = await response.json()

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
