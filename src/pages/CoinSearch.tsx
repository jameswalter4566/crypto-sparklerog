import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { supabase } from "@/integrations/supabase/client";
import { NewCoinCard } from "@/components/NewCoinCard";

interface CoinMetadata {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image_url: string | null;
  total_supply: number | null;
  coingecko_id: string | null;
  updated_at: string;
  price: number | null;
  change_24h: number | null;
  solana_addr?: string | null;
}

const CoinSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<CoinMetadata[]>([]);
  const { toast } = useToast();

  const updateSearchCount = async (coinId: string) => {
    console.log('Updating search count for coin:', coinId);
    
    // First, get the current search count
    const { data: currentData, error: fetchError } = await supabase
      .from('coin_searches')
      .select('search_count')
      .eq('coin_id', coinId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching current search count:', fetchError);
      return;
    }

    const currentCount = currentData?.search_count || 0;
    const newCount = currentCount + 1;

    // Then update or insert with the incremented count
    const { error: upsertError } = await supabase
      .from('coin_searches')
      .upsert(
        { 
          coin_id: coinId,
          last_searched_at: new Date().toISOString(),
          search_count: newCount
        },
        {
          onConflict: 'coin_id'
        }
      );

    if (upsertError) {
      console.error('Error updating search count:', upsertError);
    } else {
      console.log('Successfully updated search count to:', newCount);
    }
  };

  const handleSearch = async (mintAddress: string) => {
    if (!mintAddress) {
      toast({
        title: "Error",
        description: "Please enter a mint address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if the coin already exists in the list
      if (coins.some((coin) => coin.id === mintAddress)) {
        toast({
          title: "Info",
          description: "Coin is already in the list.",
          variant: "default",
        });
        // Even if the coin is in the list, we should still increment the search count
        await updateSearchCount(mintAddress);
        setIsLoading(false);
        return;
      }

      // Fetch existing coin from the database
      const { data: existingCoin, error: selectError } = await supabase
        .from("coins")
        .select("*")
        .eq("id", mintAddress)
        .maybeSingle();

      if (selectError) {
        console.error("Select Error:", selectError);
        throw new Error("Failed to check existing coin data.");
      }

      let coinMetadata = existingCoin as CoinMetadata | null;

      // If the coin does not exist, call the Edge Function to add it
      if (!coinMetadata) {
        const functionUrl = "https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/add-coin";

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ solana_addr: mintAddress }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Edge Function Error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        coinMetadata = result as CoinMetadata;
      }

      // Add the new coin to the state and update search count
      if (coinMetadata) {
        await updateSearchCount(coinMetadata.id);
        
        setCoins((prevCoins) => [...prevCoins, coinMetadata as CoinMetadata]);
        toast({
          title: "Success",
          description: `${coinMetadata.name} added successfully.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch token information.",
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
            name={coin.name || "Unknown Coin"}
            symbol={coin.symbol || "N/A"}
            imageUrl={coin.image_url || "/placeholder.svg"}
            price={typeof coin.price === "number" && !isNaN(coin.price) ? coin.price : null}
            change24h={typeof coin.change_24h === "number" && !isNaN(coin.change_24h) ? coin.change_24h : null}
            mintAddress={coin.id}
          />
        ))}
      </div>
    </div>
  );
};

export default CoinSearch;