import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from poll-new-coins!')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch data from Pump API
    const response = await fetch('https://api.pump.fun/api/v1/tokens/trending', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
      price: coin.price,
      change_24h: coin.price_change_24h,
      imageUrl: coin.image,
      mintAddress: coin.mint,
      usdMarketCap: coin.market_cap_usd,
      description: coin.description,
      twitter: coin.twitter_handle,
      website: coin.website,
      volume24h: coin.volume_24h,
      liquidity: coin.liquidity,
      updated_at: new Date().toISOString()
    }))

    // Store in Supabase
    const { error: insertError } = await supabaseClient
      .from('coins')
      .upsert(mappedCoins, {
        onConflict: 'id'
      })

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