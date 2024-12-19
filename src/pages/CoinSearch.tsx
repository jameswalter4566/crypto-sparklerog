import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TokenMetadata {
  name: string;
  symbol: string;
  image?: string;
  description?: string;
  tokenStandard: string;
  decimals: number;
}

const CoinSearch = () => {
  const [mintAddress, setMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coinData, setCoinData] = useState<any>(null);
  const { toast } = useToast();

  const fetchTokenMetadata = async (mintAddress: string) => {
    // Get the API key from Supabase secrets
    const { data: secretData, error: secretError } = await supabase
      .rpc('get_secret', { secret_name: 'HELIUS_API_KEY' });

    // Since get_secret returns an array, we need to get the first row
    const heliusApiKey = secretData?.[0]?.secret;
    
    if (secretError || !heliusApiKey) {
      console.error("Failed to get Helius API key:", secretError);
      throw new Error("Failed to get API key configuration. Please ensure HELIUS_API_KEY is set in Supabase.");
    }

    const HELIUS_API_URL = `https://api.helius.xyz/v0/token-metadata?api-key=${heliusApiKey}`;

    const response = await fetch(HELIUS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mintAccounts: [mintAddress],
        includeOffChain: true,
        disableCache: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token metadata: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Helius API Response:", data);

    if (!data || data.length === 0) {
      throw new Error("No token data found");
    }

    return data[0];
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a mint address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const tokenData = await fetchTokenMetadata(mintAddress.trim());
      
      // Transform the Helius API response into our app's format
      const formattedData = {
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Search Token
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Search by Mint Address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter mint address..."
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {coinData && (
        <div className="space-y-6">
          <TokenHeader
            name={coinData.name}
            symbol={coinData.symbol}
            image={coinData.image}
            price={coinData.price}
            description={coinData.description}
            tokenStandard={coinData.tokenStandard}
            decimals={coinData.decimals}
          />

          <TokenStats
            marketCap={coinData.marketCap}
            volume24h={coinData.volume24h}
            liquidity={coinData.liquidity}
          />

          <TokenSupply
            total={coinData.supply.total}
            circulating={coinData.supply.circulating}
            nonCirculating={coinData.supply.nonCirculating}
          />
        </div>
      )}
    </div>
  );
};

export default CoinSearch;