import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CoinSearch = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      console.log('Fetching metadata for:', address);
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-prices', {
        body: { address }
      });
      
      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }
      
      console.log('Received function data:', functionData);

      toast({
        title: "Success",
        description: "Token found and data has been stored",
      });

      // Navigate to the coin profile page
      navigate(`/coin/${address}`);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to search for token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Search Token
      </h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Enter Token Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter token address..."
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