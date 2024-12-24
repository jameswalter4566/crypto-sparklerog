import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface TokenSearchFormProps {
  onSearch: (mintAddress: string) => Promise<any>;
  isLoading: boolean;
}

interface CoinPreview {
  id: string;
  name: string;
  symbol: string;
  image_url: string | null;
  price: number | null;
}

export const TokenSearchForm = ({ onSearch, isLoading }: TokenSearchFormProps) => {
  const [mintAddress, setMintAddress] = useState("");
  const [previewCoin, setPreviewCoin] = useState<CoinPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAddress.trim()) return;

    try {
      const result = await onSearch(mintAddress.trim());
      if (result) {
        setPreviewCoin(result);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleCoinSelect = () => {
    if (previewCoin) {
      navigate(`/coin/${previewCoin.id}`);
      setShowPreview(false);
      setMintAddress("");
      setPreviewCoin(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || isNaN(Number(price))) return "Price not available";
    return `SOL ${Number(price).toFixed(6)}`;
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-2xl mx-auto">
        <Input
          placeholder="Search by mint address..."
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          className="flex-1 rounded-full bg-card border-2 border-primary/20 focus-visible:ring-primary animate-laser-glow transition-all duration-300 text-sm sm:text-base h-10 sm:h-12"
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="rounded-full text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {showPreview && previewCoin && (
        <Card 
          className="absolute top-full mt-2 w-full max-w-2xl z-50 bg-card border-2 border-primary/20 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={handleCoinSelect}
        >
          <div className="p-4 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={previewCoin.image_url || "/placeholder.svg"}
                alt={previewCoin.name}
              />
              <AvatarFallback>
                {previewCoin.symbol?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{previewCoin.name}</h3>
              <p className="text-muted-foreground">{previewCoin.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatPrice(previewCoin.price)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};