import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY')!;
const HELIUS_ENDPOINT = `https://api.helius.xyz/v0/?api-key=${HELIUS_API_KEY}`;

interface TokenMetadata {
  name: string;
  symbol: string;
  image: string;
  mintAddress: string;
  decimals: number;
}

interface TokenHolder {
  address: string;
  uiAmountString: string;
}

interface TokenInfo {
  metadata: TokenMetadata;
  holders: TokenHolder[];
  price: number | null;
}

async function getTokenInfo(searchAddress: string): Promise<TokenInfo> {
  try {
    // First, get the token metadata
    const metadataResponse = await fetch(HELIUS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "token-metadata",
        method: "getAsset",
        params: { id: searchAddress }
      })
    });

    const metadataData = await metadataResponse.json();
    console.log("Metadata response:", metadataData);
    
    if (metadataData.error) {
      throw new Error(metadataData.error.message || 'Failed to fetch token metadata');
    }

    const metadata = {
      name: metadataData.result?.content?.metadata?.name || "Unknown Token",
      symbol: metadataData.result?.content?.metadata?.symbol || "???",
      image: metadataData.result?.content?.links?.image || "https://via.placeholder.com/100?text=No+Image",
      mintAddress: searchAddress,
      decimals: metadataData.result?.content?.metadata?.decimals || 9
    };

    // Then, get the token holders
    const holdersResponse = await fetch(HELIUS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "token-holders",
        method: "getTokenLargestAccounts",
        params: [searchAddress]
      })
    });

    const holdersData = await holdersResponse.json();
    console.log("Holders response:", holdersData);
    
    if (holdersData.error) {
      throw new Error(holdersData.error.message || 'Failed to fetch token holders');
    }

    const holders = holdersData.result?.value?.slice(0, 3) || [];

    // Get the token price from Jupiter
    const price = await getTokenPrice(searchAddress);

    return {
      metadata,
      holders,
      price
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
}

async function getTokenPrice(mintAddress: string): Promise<number | null> {
  try {
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
    const data = await response.json();
    return data.data[mintAddress]?.price || null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenInfo = await getTokenInfo(address);
    console.log("Token info fetched:", tokenInfo);
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update the coins table with the new information
    const { error: updateError } = await supabaseClient
      .from('coins')
      .upsert({
        id: address,
        name: tokenInfo.metadata.name,
        symbol: tokenInfo.metadata.symbol,
        image_url: tokenInfo.metadata.image,
        price: tokenInfo.price,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, data: tokenInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch token information", 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});