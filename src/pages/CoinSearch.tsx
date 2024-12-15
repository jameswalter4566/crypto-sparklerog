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
      // Check if the coin already exists in our database
      const { data: existingCoin } = await supabase
        .from('coins')
        .select('*')
        .eq('id', address)
        .single();

      if (existingCoin) {
        navigate(`/coin/${address}`);
        return;
      }

      // If coin doesn't exist, create a new entry with minimal data
      const { error: insertError } = await supabase
        .from('coins')
        .insert([
          {
            id: address,
            name: `Token (${address.slice(0, 6)}...)`,
            symbol: 'UNKNOWN',
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Token has been added to the database",
      });

      navigate(`/coin/${address}`);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to add token to database",
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