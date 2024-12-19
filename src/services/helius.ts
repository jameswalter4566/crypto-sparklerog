import { supabase } from "@/integrations/supabase/client";

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  price: number;
  description: string;
  tokenStandard: string;
  decimals: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  supply: {
    total: number;
    circulating: number;
    nonCirculating: number;
  };
}

export const fetchHeliusApiKey = async (): Promise<string> => {
  const { data: secretData, error: secretError } = await supabase
    .from('secrets')
    .select('value')
    .eq('name', 'HELIUSKEYMAIN')
    .single();

  if (secretError) {
    console.error('Secret fetch error:', secretError);
    throw new Error(`Failed to fetch API key: ${secretError.message}`);
  }

  if (!secretData?.value) {
    console.error('No secret found');
    throw new Error('API key not found');
  }

  return secretData.value;
};

export const fetchTokenMetadata = async (mintAddress: string): Promise<TokenMetadata> => {
  try {
    const heliusApiKey = await fetchHeliusApiKey();
    const HELIUS_API_URL = `https://api.helius.xyz/v0/token-metadata?api-key=${heliusApiKey}`;

    const response = await fetch(HELIUS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mintAccounts: [mintAddress],
        includeOffChain: true,
        disableCache: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("No token data found for this address");
    }

    const tokenData = data[0];
    return {
      id: mintAddress,
      name: tokenData.onChainMetadata?.metadata?.name || "Unknown Token",
      symbol: tokenData.onChainMetadata?.metadata?.symbol || "???",
      image: tokenData.offChainMetadata?.metadata?.image || null,
      price: tokenData.price?.value || 0,
      description: tokenData.offChainMetadata?.metadata?.description || "No description available",
      tokenStandard: tokenData.onChainMetadata?.tokenStandard || "Unknown",
      decimals: tokenData.onChainMetadata?.metadata?.decimals || 0,
      marketCap: tokenData.marketCap || 0,
      volume24h: tokenData.volume24h || 0,
      liquidity: tokenData.liquidity || 0,
      supply: {
        total: tokenData.onChainMetadata?.supply?.total || 0,
        circulating: tokenData.onChainMetadata?.supply?.circulating || 0,
        nonCirculating: tokenData.onChainMetadata?.supply?.nonCirculating || 0,
      }
    };
  } catch (error) {
    console.error('Token metadata fetch error:', error);
    throw error;
  }
};