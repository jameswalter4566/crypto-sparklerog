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
  coingecko_id: string | null; // Changed from coingecko_coin_id to match DB schema
  updated_at: string;
  price: number | null;
  change_24h: number | null;
  announcement_url?: string[] | null;
  blockchain_site?: string[] | null;
  chat_url?: string[] | null;
  circulating_supply?: number | null;
  coin_id?: string | null;
  decimals?: number | null;
  historic_data?: any | null;
  homepage?: string | null;
  liquidity?: number | null;
  market_cap?: number | null;
  non_circulating_supply?: number | null;
  official_forum_url?: string[] | null;
  solana_addr?: string | null;
  twitter_screen_name?: string | null;
  volume_24h?: number | null;
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

      const { data: existingCoin, error: selectError } = await supabase
        .from("coins")
        .select("*")
        .eq("id", mintAddress)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Select Error:", selectError);
        throw new Error("Failed to check existing coin data.");
      }

      let coinMetadata = existingCoin as CoinMetadata | null;

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
          throw new Error("Failed to add coin via Edge Function.");
        }

        const result = await response.json();
        coinMetadata = result as CoinMetadata;
      }

      if (coinMetadata) {
        setCoins((prevCoins) => [...prevCoins, coinMetadata as CoinMetadata]);
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
            price={coin.price}
            change24h={coin.change_24h}
            mintAddress={coin.id}
          />
        ))}
      </div>
    </div>
  );
};

export default CoinSearch;