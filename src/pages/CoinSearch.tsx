import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CoinSearch = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please enter a contract address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-prices', {
        body: { address }
      });
      
      if (functionError) throw functionError;
      
      if (!functionData?.data) {
        toast({
          title: "Not Found",
          description: "No coin found with this address",
          variant: "destructive",
        });
        return;
      }

      // Ensure we're sending a properly formatted object that matches our table schema
      const coinData = {
        id: address,
        name: functionData.data.name || "Unknown",
        symbol: functionData.data.symbol || "UNKNOWN",
        price: functionData.data.price ? Number(functionData.data.price) : null,
        change_24h: functionData.data.change_24h ? Number(functionData.data.change_24h) : null,
        market_cap: functionData.data.market_cap ? Number(functionData.data.market_cap) : null,
        volume_24h: functionData.data.volume_24h ? Number(functionData.data.volume_24h) : null,
        liquidity: functionData.data.liquidity ? Number(functionData.data.liquidity) : null,
        image_url: functionData.data.image_url || null,
      };

      const { error: upsertError } = await supabase
        .from("coins")
        .upsert(coinData);

      if (upsertError) throw upsertError;

      toast({
        title: "Success",
        description: "Coin data has been fetched and stored",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to search for coin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Search Coin
      </h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Enter Contract Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter contract address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinSearch;