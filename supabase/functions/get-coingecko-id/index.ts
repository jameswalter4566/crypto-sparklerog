import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { solana_addr } = await req.json();
    console.log('Searching CoinGecko for Solana address:', solana_addr);

    if (!solana_addr) {
      throw new Error('Solana address is required');
    }

    // Search CoinGecko for the token using Solana contract address
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/list?include_platform=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const coins = await response.json();
    console.log('Searching through CoinGecko coins for Solana address match');

    // Find the coin with matching Solana contract address
    const coin = coins.find((c: any) => 
      c.platforms && 
      c.platforms.solana && 
      c.platforms.solana.toLowerCase() === solana_addr.toLowerCase()
    );

    if (!coin) {
      console.log('No matching coin found on CoinGecko');
      return new Response(
        JSON.stringify({ coingecko_id: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found matching coin:', coin.id);

    // Update the coin record in our database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('coins')
      .update({ coingecko_id: coin.id })
      .eq('solana_addr', solana_addr);

    if (updateError) {
      console.error('Error updating coin:', updateError);
    }

    return new Response(
      JSON.stringify({ coingecko_id: coin.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-coingecko-id function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});