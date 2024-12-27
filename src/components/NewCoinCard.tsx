import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyAddressButton } from "@/components/coin/CopyAddressButton";
import { VoiceChatCounter } from "@/components/coin/VoiceChatCounter";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MiniPriceChart } from "@/components/coin/MiniPriceChart";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  price: initialPrice, 
  imageUrl, 
  mintAddress,
  searchCount,
  priceHistory,
  usdMarketCap: initialMarketCap,
  change24h: initialChange24h
}: NewCoinCardProps) {
  const [price, setPrice] = useState<number | null>(initialPrice);
  const [change24h, setChange24h] = useState<number | null>(initialChange24h);
  const [marketCap, setMarketCap] = useState<number | null>(initialMarketCap);
  const { toast } = useToast();
  const symbolFallback = symbol ? symbol.slice(0, 2).toUpperCase() : "??";
  
  useEffect(() => {
    const channel = supabase
      .channel('coin-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coins',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Received real-time update for coin:', payload);
          if (payload.new) {
            const newPrice = payload.new.price;
            const newChange = payload.new.change_24h;
            const newMarketCap = payload.new.usd_market_cap;
            
            if (typeof newPrice === 'number' && newPrice !== price) {
              setPrice(newPrice);
            }
            
            if (typeof newChange === 'number' && newChange !== change24h) {
              setChange24h(newChange);
            }

            if (typeof newMarketCap === 'number' && newMarketCap !== marketCap) {
              setMarketCap(newMarketCap);
              toast({
                title: `${name} Market Cap Updated`,
                description: `New market cap: ${formatMarketCap(newMarketCap)}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, name, price, change24h, marketCap, toast]);
  
  const getGlowClass = (change24h: number | null) => {
    if (!change24h) return "";
    return change24h > 0 ? "hover:animate-price-glow-green" : "hover:animate-price-glow-red";
  };

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
    
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const defaultImage = "/placeholder.svg";
  const imageSource = imageUrl && imageUrl.trim() !== "" ? imageUrl : defaultImage;

  return (
    <Link to={`/coin/${id}`} className="block transform transition-transform hover:scale-105 duration-300">
      <Card className={cn(
        "hover:bg-gray-900 transition-colors h-full border-2 border-primary/50 relative",
        getGlowClass(change24h)
      )}>
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
            <div className="text-sm text-gray-400">
              MC: {formatMarketCap(marketCap)}
            </div>
            {priceHistory && <MiniPriceChart data={priceHistory} />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}