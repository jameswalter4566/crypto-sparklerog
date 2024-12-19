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
    try {
      // Try to fetch the secret directly from the secrets table
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'HELIUSKEYMAIN')
        .single();

      console.log('Secret fetch attempt:', { secretData, secretError });

      if (secretError) {
        console.error('Secret fetch error:', secretError);
        throw new Error(`Failed to fetch API key: ${secretError.message}`);
      }

      if (!secretData?.value) {
        console.error('No secret found');
        throw new Error('API key not found');
      }

      const heliusApiKey = secretData.value;
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
    } catch (error) {
      console.error('Token metadata fetch error:', error);
      throw error;
    }
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
        image_url: tokenData.offChainMetadata?.metadata?.image || null,
        price: tokenData.price?.value || 0,
        description: tokenData.offChainMetadata?.metadata?.description || "No description available",
        tokenStandard: tokenData.onChainMetadata?.tokenStandard || "Unknown",
        decimals: tokenData.onChainMetadata?.metadata?.decimals || 0,
        market_cap: tokenData.marketCap || 0,
        volume_24h: tokenData.volume24h || 0,
        liquidity: tokenData.liquidity || 0,
      };

      setCoinData(formattedData);

      // Store the coin data in Supabase
      const { error: upsertError } = await supabase
        .from('coins')
        .upsert({
          id: formattedData.id,
          name: formattedData.name,
          symbol: formattedData.symbol,
          image_url: formattedData.image_url,
          price: formattedData.price,
          market_cap: formattedData.market_cap,
          volume_24h: formattedData.volume_24h,
          liquidity: formattedData.liquidity,
        });

      if (upsertError) {
        console.error('Error saving coin data:', upsertError);
        toast({
          title: "Warning",
          description: "Token information retrieved but failed to save to database",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Token information retrieved successfully",
        });
      }
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Search Token
      </h1>
      
      <TokenSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {coinData && (
        <TokenDetails coinData={coinData} onClick={() => navigate(`/coin/${coinData.id}`)} />
      )}
    </div>
  );
};

export default CoinSearch;