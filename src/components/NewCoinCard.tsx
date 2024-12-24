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
        <CardHeader className="p-5 sm:p-6">
          <div className="flex flex-col items-center gap-5">
            <Avatar className="h-32 w-32 sm:h-48 sm:w-48">
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
            <div className="flex items-center gap-4">
              <CopyAddressButton solanaAddr={mintAddress || ""} />
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">
              <div className="truncate max-w-[180px] sm:max-w-[220px] text-center" title={name || "Unnamed Coin"}>
                {name || "Unnamed Coin"}
              </div>
            </CardTitle>
            <span className="text-lg sm:text-xl text-gray-400 truncate max-w-[180px] sm:max-w-[220px]">{symbol || "N/A"}</span>
            <div className="mt-1 text-xl sm:text-2xl font-medium truncate max-w-[180px] sm:max-w-[220px]">{formatPrice(price)}</div>
            <div className={`text-lg sm:text-xl ${change24h && change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatChange(change24h)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}