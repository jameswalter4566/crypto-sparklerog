import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { useToast } from "@/components/ui/use-toast";

const CoinSearch = () => {
  const [mintAddress, setMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coinData, setCoinData] = useState<any>(null);
  const { toast } = useToast();

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
      // For demo purposes, we'll use a mock response
      // In a real implementation, you would fetch data from Helius API
      const mockResponse = {
        name: "Test Token",
        symbol: "TEST",
        image: null,
        price: 0.5,
        description: "This is a test token found by mint address",
        tokenStandard: "SPL Token",
        decimals: 9,
        marketCap: 1000000,
        volume24h: 50000,
        liquidity: 25000,
        supply: {
          total: 1000000000,
          circulating: 750000000,
          nonCirculating: 250000000,
        },
      };

      setCoinData(mockResponse);
      toast({
        title: "Success",
        description: "Token information retrieved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch token information",
        variant: "destructive",
      });
      console.error("Search error:", error);
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