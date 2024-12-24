import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyAddressButton } from "@/components/coin/CopyAddressButton";
import { VoiceChatCounter } from "@/components/coin/VoiceChatCounter";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MiniPriceChart } from "@/components/coin/MiniPriceChart";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
  imageUrl?: string;
  mintAddress?: string;
  searchCount?: number;
  priceHistory?: Array<{ price: number; timestamp: string; }> | null;
  usdMarketCap?: number | null;
}

export function NewCoinCard({ 
  id, 
  name, 
  symbol, 
  price, 
  imageUrl, 
  mintAddress,
  searchCount,
  priceHistory,
  usdMarketCap
}: NewCoinCardProps) {
  const symbolFallback = symbol ? symbol.slice(0, 2).toUpperCase() : "??";

  const formatPrice = (value: number | null) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "Price not available";
    }
    return `SOL ${value.toFixed(6)}`;
  };

  const formatMarketCap = (value: number | null) => {
    if (value === null || isNaN(value)) {
      return "N/A";
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const defaultImage = "/placeholder.svg";
  const imageSource = imageUrl && imageUrl.trim() !== "" ? imageUrl : defaultImage;

  return (
    <Link to={`/coin/${id}`} className="block">
      <Card className="hover:bg-gray-900 transition-colors h-full border-2 border-primary/50 animate-laser-border relative">
        {searchCount !== undefined && searchCount > 0 && (
          <div className="absolute top-2 right-2 z-10 flex flex-col items-center">
            <Badge 
              variant="secondary" 
              className="text-[12.5px] px-2 py-1 bg-yellow-500/90 hover:bg-yellow-500/90 text-black font-semibold"
            >
              {searchCount}
            </Badge>
            <span className="text-[9.5px] text-yellow-500/90 mt-0.5 font-medium">Searches</span>
          </div>
        )}
        <CardHeader className="p-3 sm:p-5">
          <div className="flex flex-col items-center gap-3 sm:gap-5">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage 
                src={imageSource}
                alt={name || "Unknown Coin"}
                className="object-cover"
                onError={(e) => {
                  console.log('Image failed to load, using fallback');
                  const img = e.target as HTMLImageElement;
                  img.src = defaultImage;
                }}
              />
              <AvatarFallback>{symbolFallback}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 sm:gap-4">
              <CopyAddressButton solanaAddr={mintAddress || ""} />
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-5">
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <CardTitle className="text-base sm:text-lg">
              <div className="truncate max-w-[140px] sm:max-w-[180px] text-center" title={name || "Unnamed Coin"}>
                {name || "Unnamed Coin"}
              </div>
            </CardTitle>
            <span className="text-sm sm:text-lg text-gray-400 truncate max-w-[140px] sm:max-w-[180px]">{symbol || "N/A"}</span>
            <div className="mt-1 text-lg sm:text-xl font-medium truncate max-w-[140px] sm:max-w-[180px]">{formatPrice(price)}</div>
            {usdMarketCap && (
              <div className="text-sm sm:text-lg text-gray-400">
                MC: {formatMarketCap(usdMarketCap)}
              </div>
            )}
            {priceHistory && <MiniPriceChart data={priceHistory} />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}