// add-coin/index.ts

// Import type definitions for Supabase Edge Runtime
// import "https://deno.land/x/supabase@1.0.0/functions-js/edge-runtime.d.ts";

// Import necessary modules
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import {
  createUmi,
  Umi,
} from "https://esm.sh/@metaplex-foundation/umi-bundle-defaults@0.9.2";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "https://esm.sh/@metaplex-foundation/umi@0.9.2";
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "https://esm.sh/@metaplex-foundation/mpl-token-metadata@3.3.0";
import { PublicKey } from "https://esm.sh/@solana/web3.js@1.98.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Allow only POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON body
    const { solana_addr } = await req.json();

    // Validate the input
    if (!solana_addr || typeof solana_addr !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'solana_addr' in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Umi instance for Solana metadata fetching
    const umi: Umi = createUmi("https://api.mainnet-beta.solana.com");

    // Use the mplTokenMetadata plugin
    umi.use(mplTokenMetadata());

    // Generate a new keypair (if needed, else you can skip if not using a signer)
    const keypair = generateSigner(umi);
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

    // The mint address of the token you want to fetch
    const mintAddress = new PublicKey(solana_addr);

    // Fetch the digital asset metadata from Solana
    const asset = await fetchDigitalAsset(umi, mintAddress);

    // Initialize variables to hold metadata
    let name = "";
    let symbol = "";
    let description = "";
    let image_url = "";

    // Fetch and parse the JSON metadata from the asset's URI
    if (asset.metadata.uri) {
      const metadataResponse = await fetch(asset.metadata.uri);
      if (metadataResponse.ok) {
        const jsonMetadata = await metadataResponse.json();
        console.log('solana metadata: ', jsonMetadata)
        name = jsonMetadata.name || "";
        symbol = jsonMetadata.symbol || "";
        description = jsonMetadata.description || "";
        image_url = jsonMetadata.image || "";
      } else {
        console.warn("Failed to fetch JSON metadata from URI.");
        return new Response(
          JSON.stringify({ error: "Failed to fetch JSON metadata from URI." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch additional data from CoinGecko Terminal API
    const coingeckoResponse = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${solana_addr}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json"
        },
      }
    );

    if (!coingeckoResponse.ok) {
      console.warn("Failed to fetch coin data from CoinGecko.");
      return new Response(
        JSON.stringify({ error: "Failed to fetch coin data from CoinGecko." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const coinData = await coingeckoResponse.json();
    console.log('coingecko data: ', coinData)

    // Extract necessary fields from CoinGecko response
    const attributes = coinData.data.attributes;
    const coingecko_id = attributes.coingecko_coin_id || null;
    
    // Process total_supply with decimals
    let total_supply = null;
    if (attributes.total_supply && attributes.decimals !== undefined && attributes.decimals !== null) {
      const total_supply_raw = attributes.total_supply;
      const decimals = attributes.decimals;

      // Ensure that total_supply_raw is a valid number string
      const total_supply_number = Number(total_supply_raw);
      if (!isNaN(total_supply_number) && decimals >= 0) {
        total_supply = total_supply_number / Math.pow(10, decimals);
      } else {
        console.warn("Invalid total_supply or decimals value.");
        total_supply = null;
      }
    } else {
      console.warn("total_supply or decimals not found in Terminal API response.");
      total_supply = null;
    }

    let price = attributes.price_usd || null;
    let volume_24h = attributes.volume_usd.h24 || null;
    let market_cap = attributes.market_cap_usd || null;
    let decimals = attributes.decimals || null;

    let change_24h = null;
    let circulating_supply = null;
    let non_circulating_supply = null;
    let historic_data = null;

    // Combine all data with image handling
    const fallbackImageUrl = "https://your-supabase-url.supabase.co/storage/v1/object/public/avatars/default.png"; // Replace with your actual fallback image URL

    let finalImageUrl = fallbackImageUrl;

    if (image_url) {
      try {
        // Fetch the image from IPFS
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch image from IPFS.");
        }
    
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
    
        // Determine the file extension from the image URL
        const url = new URL(image_url);
        const pathname = url.pathname;
        const lastDot = pathname.lastIndexOf('.');
        let extension = 'png'; // default extension
        if (lastDot !== -1 && lastDot < pathname.length - 1) {
          const extWithParams = pathname.substring(lastDot + 1);
          const ext = extWithParams.split('?')[0];
          extension = ext || 'png';
        }
    
        // Define the file path in the "avatars" bucket directly (no folders)
        const filePath = `${solana_addr}.${extension}`;
    
        // Upload the image to the "avatars" bucket directly
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, uint8Array, {
            contentType: imageBlob.type,
            upsert: true, // Overwrite if exists
          });
    
        if (uploadError) {
          throw uploadError;
        }
    
        // Get the public URL of the uploaded image
        const publicUrlResponse = supabase.storage.from("avatars").getPublicUrl(filePath);

        if (publicUrlResponse.error || !publicUrlResponse.data.publicUrl) {
          throw new Error("Failed to get public URL for the image.");
        }

        finalImageUrl = publicUrlResponse.data.publicUrl;
      } catch (error) {
        console.error("Image processing error:", error);
        // finalImageUrl remains as the fallback
      }
    }

    if (coingecko_id) {
      // Fetch additional data from CoinGecko API
      const coingeckoApiResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coingecko_id}?localization=false`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
            "x-cg-demo-api-key": "CG-FPFWTmsu6NTuzHvntsXiRxJJ"
          },
        }
      );

      if (!coingeckoApiResponse.ok) {
        console.warn("Failed to fetch additional coin data from CoinGecko.");
      } else {
        const coingeckoApiData = await coingeckoApiResponse.json();

        const marketData = coingeckoApiData.market_data;

        if (marketData) {
          // Update price if available
          if (marketData.current_price && typeof marketData.current_price.usd === 'number') {
            price = marketData.current_price.usd;
          }

          // Update 24h volume if available
          if (marketData.total_volume && typeof marketData.total_volume.usd === 'number') {
            volume_24h = marketData.total_volume.usd;
          }

          // Update market cap if available
          if (marketData.market_cap && typeof marketData.market_cap.usd === 'number') {
            market_cap = marketData.market_cap.usd;
          }

          // Extract 24h price change percentage
          if (typeof marketData.price_change_percentage_24h === 'number') {
            change_24h = marketData.price_change_percentage_24h;
          }

          // Extract circulating supply
          if (typeof marketData.circulating_supply === 'number') {
            circulating_supply = marketData.circulating_supply;
          }

          // Calculate non-circulating supply if possible
          if (typeof total_supply === 'number' && typeof circulating_supply === 'number') {
            non_circulating_supply = total_supply - circulating_supply;
          } else if (typeof marketData.total_supply === 'number' && typeof marketData.circulating_supply === 'number') {
            non_circulating_supply = marketData.total_supply - marketData.circulating_supply;
          } else {
            non_circulating_supply = null;
          }

          // Fetch historic price data from market_chart endpoint
          const marketChartResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coingecko_id}/market_chart?vs_currency=usd&days=7&precision=full`,
            {
              method: "GET",
              headers: {
                "accept": "application/json",
                "x-cg-demo-api-key": "CG-FPFWTmsu6NTuzHvntsXiRxJJ",
              },
            }
          );

          if (!marketChartResponse.ok) {
            console.warn("Failed to fetch historic market data from CoinGecko Market Chart API.");
            // Optionally, handle the error as needed
          } else {
            const marketChartData = await marketChartResponse.json();
            console.log('Market Chart API data:', marketChartData);

            if (marketChartData.prices && Array.isArray(marketChartData.prices)) {
              historic_data = marketChartData.prices;
            } else {
              console.warn("Prices array not found in Market Chart API response.");
              historic_data = null;
            }
          }

        } else {
          console.warn("Market data not found in main CoinGecko API response.");
        }
      }

    }

    // Combine all data
    const combinedData = {
      id: solana_addr,
      name,
      symbol,
      description,
      image_url: finalImageUrl,
      total_supply,
      coingecko_id,
      price, 
      volume_24h,
      circulating_supply,
      non_circulating_supply,
      change_24h,
      decimals,
      market_cap,
      historic_data,
      updated_at: new Date(),
    };

    console.log(combinedData)

    // Upsert into 'coins' table
    const { data: upsertData, error: upsertError } = await supabase
      .from("coins")
      .upsert(combinedData, { onConflict: "solana_addr" })
      .select();

    if (upsertError) {
      console.error("Upsert Error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to upsert coin data." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const insertedCoin = upsertData[0];

    // Respond with success
    return new Response(
      JSON.stringify(insertedCoin),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
