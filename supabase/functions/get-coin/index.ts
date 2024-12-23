import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Database } from '../_shared/database.types.ts'
import { fetchSolscanData } from '../_shared/solscan.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      throw new Error('Token ID is required')
    }

    console.log('Processing request for token:', id)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Get coin data from database
    const { data: dbCoin, error: dbError } = await supabase
      .from('coins')
      .select('id, name, symbol, price, market_cap, volume_24h, liquidity, total_supply, image_url, solana_addr')
      .eq('id', id)
      .maybeSingle()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to fetch token data from database')
    }

    // If no coin found in database, fetch from blockchain
    if (!dbCoin) {
      console.log('Coin not found in database, fetching from blockchain...')
      const solanaData = await fetchSolscanData(id)
      
      if (!solanaData) {
        throw new Error('Token not found')
      }

      // Insert the new coin data
      const { error: insertError } = await supabase
        .from('coins')
        .insert({
          id: id,
          name: solanaData.data.name,
          symbol: solanaData.data.symbol,
          price: solanaData.data.price,
          market_cap: solanaData.data.marketcap,
          volume_24h: solanaData.data.volume24h,
          total_supply: parseFloat(solanaData.data.supply),
          image_url: solanaData.data.icon,
          solana_addr: id,
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error inserting new coin:', insertError)
      }

      return new Response(
        JSON.stringify({
          terminalData: solanaData.data,
          mainData: {
            market_cap: solanaData.data.marketcap,
            volume_24h: solanaData.data.volume24h,
            price: solanaData.data.price,
            image_url: solanaData.data.icon
          }
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch fresh data for existing coin
    console.log('Fetching fresh data for existing coin:', id)
    const freshData = await fetchSolscanData(dbCoin.solana_addr || id)

    if (freshData) {
      // Update database with new data
      const { error: updateError } = await supabase
        .from('coins')
        .update({
          price: freshData.data.price,
          market_cap: freshData.data.marketcap,
          volume_24h: freshData.data.volume24h,
          image_url: freshData.data.icon || dbCoin.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating coin data:', updateError)
      }

      return new Response(
        JSON.stringify({
          terminalData: freshData.data,
          mainData: {
            market_cap: freshData.data.marketcap,
            volume_24h: freshData.data.volume24h,
            price: freshData.data.price,
            image_url: freshData.data.icon || dbCoin.image_url
          }
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return database data if fresh data fetch fails
    return new Response(
      JSON.stringify({
        terminalData: {
          name: dbCoin.name,
          symbol: dbCoin.symbol,
          price: dbCoin.price,
          volume_24h: dbCoin.volume_24h,
          total_supply: dbCoin.total_supply,
          icon: dbCoin.image_url
        },
        mainData: {
          market_cap: dbCoin.market_cap,
          volume_24h: dbCoin.volume_24h,
          price: dbCoin.price,
          image_url: dbCoin.image_url
        }
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-coin function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})