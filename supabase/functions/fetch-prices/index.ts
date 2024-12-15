import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, validateSolanaAddress, createErrorResponse } from './utils.ts';
import { SolscanAPI } from './solscan-api.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const contractAddress = requestData.contractAddress;
    console.log('Contract address from request:', contractAddress);

    if (!contractAddress) {
      return createErrorResponse('Token address is required');
    }

    if (!validateSolanaAddress(contractAddress)) {
      return createErrorResponse('Invalid Solana address format', { contractAddress });
    }

    const SOLSCAN_API_KEY = Deno.env.get('SOLSCAN_API_KEY');
    if (!SOLSCAN_API_KEY) {
      throw new Error('Missing SOLSCAN_API_KEY environment variable');
    }

    const solscan = new SolscanAPI({ apiKey: SOLSCAN_API_KEY });

    // Fetch all token data in parallel
    console.log('Fetching token data from Solscan...');
    
    try {
      const [metadata, transfers, market, price] = await Promise.all([
        solscan.fetchTokenMetadata(contractAddress),
        solscan.fetchTokenTransfers(contractAddress),
        solscan.fetchTokenMarket(contractAddress),
        solscan.fetchTokenPrice(contractAddress)
      ]);

      console.log('API Responses:', {
        metadata,
        transfers,
        market,
        price
      });

      // Check for successful responses
      if (!metadata.success || !transfers.success) {
        console.error('Failed responses:', { metadata, transfers });
        return createErrorResponse('Failed to fetch token data', {
          metadata: metadata.error,
          transfers: transfers.error
        });
      }

      // Process and combine the data
      const tokenData = {
        name: metadata.data?.name || `Unknown Token (${contractAddress.slice(0, 6)}...)`,
        symbol: metadata.data?.symbol || 'UNKNOWN',
        decimals: metadata.data?.decimals ?? 9,
        image: metadata.data?.icon || null,
        description: metadata.data?.description || null,
        supply: {
          total: metadata.data?.supply?.total || null,
          circulating: metadata.data?.supply?.circulating || null,
        },
        price: market.data?.priceUsdt || null,
        marketCap: market.data?.marketCapFD || null,
        volume24h: market.data?.volume24h || null,
        liquidity: market.data?.liquidity || null,
        change24h: market.data?.priceChange24h || null,
        priceHistory: price.data || [],
        recentTransfers: transfers.data || [],
        success: true
      };

      return new Response(
        JSON.stringify(tokenData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error fetching token data:', error);
      return createErrorResponse('Failed to fetch token data', error.toString());
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return createErrorResponse(
      'Failed to process request',
      error.toString(),
      500
    );
  }
});