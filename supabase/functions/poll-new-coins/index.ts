import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from poll-new-coins!')

// Create a Supabase client with the Auth context of the function
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching trending coins from Pump API...')

    // Fetch data from Pump API
    const response = await fetch('https://api.pump.fun/api/v1/tokens/trending', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch from Pump API:', response.status, response.statusText)
      throw new Error(`Failed to fetch from Pump API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received data from Pump API:', data)

    if (!Array.isArray(data)) {
      console.error('Unexpected API response format:', data)
      throw new Error('Unexpected API response format')
    }

    // Map the data to our database schema
    const mappedCoins = data.map(coin => ({
      id: coin.mint,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.price,
      change_24h: coin.price_change_24h,
      image_url: coin.image,
      solana_addr: coin.mint,
      market_cap: coin.market_cap_usd,
      description: coin.description,
      twitter_screen_name: coin.twitter_handle,
      website: coin.website,
      volume_24h: coin.volume_24h,
      liquidity: coin.liquidity,
      updated_at: new Date().toISOString()
    }))

    console.log('Mapped coins:', mappedCoins)

    // Store in Supabase
    const { error: insertError } = await supabaseClient
      .from('coins')
      .upsert(mappedCoins, {
        onConflict: 'id'
      })

    if (insertError) {
      console.error('Error inserting coins:', insertError)
      throw insertError
    }

    console.log('Successfully updated coins in database')

    return new Response(
      JSON.stringify({ success: true, count: mappedCoins.length }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in poll-new-coins:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})