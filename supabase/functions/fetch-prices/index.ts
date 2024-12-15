import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      console.log(`Attempt ${i + 1} failed with status: ${response.status}`);
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, i)));
    } catch (error) {
      console.error(`Attempt ${i + 1} failed with error:`, error);
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json()
    if (!address) {
      throw new Error('Token address is required')
    }

    console.log('Processing request for token address:', address)

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Get Helius API key
    const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY')
    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY is not set')
    }

    console.log('Fetching token metadata from Helius API')
    
    // Fetch token metadata with retry logic
    const metadataResponse = await fetchWithRetry(
      `https://api.helius.xyz/v1/token-metadata?api-key=${HELIUS_API_KEY}&tokenAddress=${address}`
    );

    const metadataResult = await metadataResponse.json()
    console.log('Raw metadata response:', metadataResult)

    // Fetch token supply using RPC
    console.log('Fetching token supply data')
    const supplyResponse = await fetchWithRetry(
      `https://api.helius.xyz/v0/token-metadata/${address}?api-key=${HELIUS_API_KEY}`
    );

    const supplyData = await supplyResponse.json()
    console.log('Raw supply data:', supplyData)

    // Fetch DAS data for market information
    console.log('Fetching DAS market data')
    const dasResponse = await fetchWithRetry(
      `https://api.helius.xyz/v0/token-metadata/DAS/${address}?api-key=${HELIUS_API_KEY}`
    );

    const dasData = await dasResponse.json()
    console.log('Raw DAS data:', dasData)

    // Extract and format token data with careful null checking
    const metadata = {
      name: metadataResult?.onChainMetadata?.metadata?.name || 
            metadataResult?.offChainMetadata?.metadata?.name || 
            `Token ${address.slice(0, 6)}...`,
      symbol: metadataResult?.onChainMetadata?.metadata?.symbol || 'UNKNOWN',
      decimals: metadataResult?.onChainMetadata?.metadata?.decimals || 9,
      image: metadataResult?.offChainMetadata?.metadata?.image || 
             metadataResult?.onChainMetadata?.metadata?.uri || 
             null,
      description: metadataResult?.offChainMetadata?.metadata?.description || null,
      tokenStandard: metadataResult?.onChainMetadata?.tokenStandard || null,
      supply: {
        total: supplyData?.supply?.total || null,
        circulating: supplyData?.supply?.circulating || null,
        nonCirculating: supplyData?.supply?.nonCirculating || null
      },
      // Market data from DAS with careful null checking
      price: dasData?.price || null,
      marketCap: dasData?.marketCap || null,
      volume24h: dasData?.volume24h || null,
      liquidity: dasData?.liquidity || null,
      change24h: dasData?.priceChange24h || null
    }

    // Update Supabase database with null-safe values
    console.log('Updating Supabase database with token data')
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert({
        id: address,
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || 'UNKNOWN',
        image_url: metadata.image || null,
        price: metadata.price || null,
        change_24h: metadata.change24h || null,
        market_cap: metadata.marketCap || null,
        volume_24h: metadata.volume24h || null,
        liquidity: metadata.liquidity || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('Failed to update database:', upsertError)
      throw upsertError
    }

    console.log('Successfully processed token data:', metadata)
    return new Response(
      JSON.stringify(metadata),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})