import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyAddressButton } from "@/components/coin/CopyAddressButton";
import { VoiceChatCounter } from "@/components/coin/VoiceChatCounter";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
  imageUrl?: string;
  mintAddress?: string;
  searchCount?: number;
}

export function NewCoinCard({ 
  id, 
  name, 
  symbol, 
  price, 
  change24h, 
  imageUrl, 
  mintAddress,
  searchCount
}: NewCoinCardProps) {
  const symbolFallback = symbol ? symbol.slice(0, 2).toUpperCase() : "??";

  const formatPrice = (value: number | null) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "Price not available";
    }
    return `SOL ${value.toFixed(6)}`;
  };

  const formatChange = (value: number | null) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "N/A";
    }
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  // Use a default placeholder if imageUrl is undefined or empty
  const defaultImage = "/placeholder.svg";
  const imageSource = imageUrl && imageUrl.trim() !== "" ? imageUrl : defaultImage;

  return (
    <Link to={`/coin/${id}`} className="block">
      <Card className="hover:bg-gray-900 transition-colors h-full border-2 border-primary/50 animate-laser-border relative">
        {searchCount !== undefined && searchCount > 0 && (
          <div className="absolute top-1 right-1 z-10 flex flex-col items-center">
            <Badge 
              variant="secondary" 
              className="text-[11.5px] px-2 py-1 bg-yellow-500/90 hover:bg-yellow-500/90 text-black font-semibold"
            >
              {searchCount}
            </Badge>
            <span className="text-[8px] text-yellow-500/90 mt-0.5 font-medium">Searches</span>
          </div>
        )}
        <CardHeader className="p-2 sm:p-3">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
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
            <div className="flex items-center gap-1">
              <CopyAddressButton solanaAddr={mintAddress || ""} />
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="flex flex-col items-center gap-1">
            <CardTitle className="text-xs sm:text-sm">
              <span className="truncate max-w-[120px]">{name || "Unnamed Coin"}</span>
            </CardTitle>
            <span className="text-xs text-gray-400">{symbol || "N/A"}</span>
            <div className="mt-1 text-sm font-medium">{formatPrice(price)}</div>
            <div className={`text-xs ${change24h && change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatChange(change24h)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}