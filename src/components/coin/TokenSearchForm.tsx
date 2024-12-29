import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface TokenSearchFormProps {
  onSearch: (mintAddress: string) => Promise<any>;
  isLoading: boolean;
  isMobileHeader?: boolean;
}

interface CoinPreview {
  id: string;
  name: string;
  symbol: string;
  image_url: string | null;
  price: number | null;
}

export const TokenSearchForm = ({ onSearch, isLoading, isMobileHeader }: TokenSearchFormProps) => {
  const [mintAddress, setMintAddress] = useState("");
  const [previewCoin, setPreviewCoin] = useState<CoinPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  // Don't render on mobile if not in header, and don't render on desktop if in header
  if ((isMobile && !isMobileHeader) || (!isMobile && isMobileHeader)) {
    return null;
  }

  return (
    <div className="relative w-full max-w-xl mx-auto px-2 sm:px-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
        <Input
          placeholder="Search by mint address..."
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          className="flex-1 rounded-full bg-card border-2 border-primary/20 focus-visible:ring-primary animate-laser-glow transition-all duration-300 text-sm sm:text-base h-10 sm:h-12"
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="rounded-full text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 w-full sm:w-auto"
        >
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {showPreview && previewCoin && (
        <Card 
          className="absolute top-full mt-2 w-full z-50 bg-card border-2 border-primary/20 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={handleCoinSelect}
        >
          <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage 
                src={previewCoin.image_url || "/placeholder.svg"}
                alt={previewCoin.name}
              />
              <AvatarFallback>
                {previewCoin.symbol?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">{previewCoin.name}</h3>
              <p className="text-muted-foreground text-sm truncate">{previewCoin.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm sm:text-base">{formatPrice(previewCoin.price)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};