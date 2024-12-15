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

    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY')
    if (!ALCHEMY_API_KEY) {
      throw new Error('ALCHEMY_API_KEY is not set')
    }

    // Fetch token data from Alchemy
    const alchemyResponse = await fetch(
      `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-address`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          addresses: [{
            network: 'solana-mainnet',
            address: address
          }]
        })
      }
    )

    if (!alchemyResponse.ok) {
      throw new Error(`Alchemy API error: ${alchemyResponse.statusText}`)
    }

    const alchemyData = await alchemyResponse.json()
    
    if (!alchemyData.data || !alchemyData.data[0]) {
      return new Response(
        JSON.stringify({ 
          name: "Unknown Token",
          symbol: "UNKNOWN",
          image: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const tokenData = alchemyData.data[0]
    const price = tokenData.prices[0]?.value || null

    // Update the token data in Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient
      .from('coins')
      .upsert({
        id: address,
        price: price ? parseFloat(price) : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    return new Response(
      JSON.stringify({
        name: tokenData.name || "Unknown Token",
        symbol: tokenData.symbol || "UNKNOWN",
        image: tokenData.image || null,
        price: price ? parseFloat(price) : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch token data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})