import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { supabase } from "@/integrations/supabase/client"
import { NewCoinCard } from "@/components/NewCoinCard"

interface CoinMetadata {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image_url: string;
  total_supply: number | null;
  coingecko_coin_id: string | null;
  updated_at: string;
  price: number;
  change_24h: number | null;
}

const CoinSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<CoinMetadata[]>([]);
  const { toast } = useToast();

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

      if (coins.some((coin) => coin.id === mintAddress)) {
        toast({
          title: "Info",
          description: "Coin is already in the list.",
          variant: "default",
        });
        return;
      }
      
      // Step 1: Query the 'coins' table to check if the record exists
      const { data: existingCoin, error: selectError } = await supabase
        .from<CoinMetadata>("coins")
        .select("*")
        .eq("id", mintAddress)
        .single();

      if (selectError && selectError.code !== "PGRST116") { // PGRST116 typically means 'Row not found'
        console.error("Select Error:", selectError);
        throw new Error("Failed to check existing coin data.");
      }

      let coinMetadata: CoinMetadata | null = existingCoin || null;

      if (!coinMetadata) {
        // Step 2: If record doesn't exist, call the Edge Function to add the coin
        const functionUrl = "https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/add-coin";

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer your-auth-token`,
          },
          body: JSON.stringify({ solana_addr: mintAddress }),
        });

        const result = await response.json();
        console.log(result)

        if (!response.ok) {
          toast({
            title: "Info",
            description: "Error retrieving coin details.",
            variant: "destructive",
          });
          throw new Error(result.error || "Failed to add coin via Edge Function.");
        }

        coinMetadata = result as CoinMetadata;
      }

      if (coinMetadata) {
        // Add the coin to the coins list
        setCoins((prevCoins) => [...prevCoins, coinMetadata]);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {coins.map((coin) => (
          <NewCoinCard
            key={coin.id}
            id={coin.id}
            name={coin.name}
            symbol={coin.symbol}
            imageUrl={coin.image_url}
            // price={coin.price}
            // change24h={coin.change_24h}
          />
        ))}
      </div>
    </div>
  );
};

export default CoinSearch;