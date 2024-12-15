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
      const response = await fetch(
        `${window.location.origin}/functions/fetch-prices?address=${address}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch coin data");
      }

      const { data, error: dataError } = await response.json();
      
      if (dataError) throw new Error(dataError);
      
      if (!data || data.length === 0) {
        toast({
          title: "Not Found",
          description: "No coin found with this address",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("coins")
        .upsert(data[0], { onConflict: "id" });

      if (error) throw error;

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