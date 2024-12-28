import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from poll-new-coins!')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch data from Pump API
    const response = await fetch('https://frontend-api-v2.pump.fun/coins/for-you?offset=0&limit=50&includeNsfw=false', {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://pump.fun',
        'Referer': 'https://pump.fun/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch coins: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received data from Pump API:', data)

    // Map the API response to our format
    const mappedCoins = data.map((coin: any) => ({
      id: coin.mint,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.virtual_sol_reserves / coin.virtual_token_reserves,
      change_24h: 0, // Calculate from historic data if available
      imageUrl: coin.image_uri,
      mintAddress: coin.mint,
      priceHistory: [], // Would need separate API call for history
      usdMarketCap: coin.usd_market_cap,
      description: coin.description,
      twitter: coin.twitter,
      website: coin.website,
      volume24h: coin.virtual_sol_reserves,
      liquidity: coin.virtual_token_reserves,
      searchCount: 0,
      updated_at: new Date().toISOString()
    }))

    // Store in Supabase
    const { error: insertError } = await supabaseClient
      .from('coins')
      .upsert(mappedCoins)

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ coins: mappedCoins }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})