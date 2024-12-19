import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { TokenDetails } from "@/components/coin/TokenDetails";
import { fetchTokenMetadata } from "@/services/helius";
import { saveCoinData } from "@/services/coins";
import type { TokenMetadata } from "@/services/helius";

const CoinSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coinData, setCoinData] = useState<TokenMetadata | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      setCoinData(tokenData);
      
      await saveCoinData(tokenData);
      
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
      
      <TokenSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {coinData && (
        <TokenDetails 
          coinData={coinData} 
          onClick={() => navigate(`/coin/${coinData.id}`)} 
        />
      )}
    </div>
  );
};

export default CoinSearch;