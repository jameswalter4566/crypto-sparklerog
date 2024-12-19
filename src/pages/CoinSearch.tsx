import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { TokenDetails } from "@/components/coin/TokenDetails";

const CoinSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coinData, setCoinData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTokenMetadata = async (mintAddress: string) => {
    const { data: secretData, error: secretError } = await supabase
      .rpc('get_secret', { secret_name: 'HELIUSKEYMAIN' });

    if (secretError) {
      if (secretError.message.includes("Secret not found")) {
        throw new Error('Helius API key is not configured. Please add it in the Supabase settings.');
      }
      throw secretError;
    }

    if (!secretData || !Array.isArray(secretData) || secretData.length === 0 || !secretData[0]?.secret) {
      throw new Error('Invalid API key configuration');
    }

    const heliusApiKey = secretData[0].secret;
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

    return data[0];
  };

  const handleSearch = async (mintAddress: string) => {
    if (!mintAddress) {
      toast({
        title: "Error",
        description: "Please enter a mint address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const tokenData = await fetchTokenMetadata(mintAddress);
      
      const formattedData = {
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
          total: parseInt(tokenData.supply?.total || "0"),
          circulating: parseInt(tokenData.supply?.circulating || "0"),
          nonCirculating: parseInt(tokenData.supply?.nonCirculating || "0"),
        },
      };

      setCoinData(formattedData);
      toast({
        title: "Success",
        description: "Token information retrieved successfully",
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch token information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = async () => {
    if (!coinData) return;

    try {
      const { error } = await supabase
        .from('coins')
        .upsert({
          id: coinData.id,
          name: coinData.name,
          symbol: coinData.symbol,
          image_url: coinData.image,
          price: coinData.price,
          market_cap: coinData.marketCap,
          volume_24h: coinData.volume24h,
          liquidity: coinData.liquidity,
        });

      if (error) {
        throw error;
      }

      navigate(`/coin/${coinData.id}`);
    } catch (error) {
      console.error('Error saving coin:', error);
      toast({
        title: "Error",
        description: "Failed to save coin data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Search Token
      </h1>
      
      <TokenSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {coinData && (
        <TokenDetails coinData={coinData} onClick={handleViewProfile} />
      )}
    </div>
  );
};

export default CoinSearch;