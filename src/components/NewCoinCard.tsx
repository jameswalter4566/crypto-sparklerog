import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyAddressButton } from "@/components/coin/CopyAddressButton";
import { VoiceChatCounter } from "@/components/coin/VoiceChatCounter";
import { Link } from "react-router-dom";
import { MiniPriceChart } from "@/components/coin/MiniPriceChart";
import { SearchCountBadge } from "@/components/coin/SearchCountBadge";
import { MarketCapDisplay } from "@/components/coin/MarketCapDisplay";
import { cardColors } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Coins, Twitter, Globe } from "lucide-react";

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
  description?: string | null;
  twitter?: string | null;
  website?: string | null;
  volume24h?: number | null;
  liquidity?: number | null;
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
  change24h: initialChange24h,
  description,
  twitter,
  website,
  volume24h,
  liquidity
}: NewCoinCardProps) {
  const [price, setPrice] = useState<number | null>(initialPrice);
  const [change24h, setChange24h] = useState<number | null>(initialChange24h);
  const [marketCap, setMarketCap] = useState<number | null>(initialMarketCap);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  
  const cardColor = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * cardColors.length);
    return cardColors[randomIndex];
  }, []);

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
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, price, change24h, marketCap]);

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

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/coin/${id}`} className="block transform transition-transform hover:scale-105 duration-300">
      <Card 
        className={cn(
          "hover:bg-gray-900 transition-colors h-full border-2 border-primary/50 relative",
          getGlowClass(change24h)
        )}
        style={{ backgroundColor: cardColor }}
      >
        <SearchCountBadge count={searchCount || 0} />
        <CardHeader className="p-3 sm:p-5">
          <div className="flex flex-col items-center gap-3 sm:gap-5">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 bg-gray-800">
              {!imageError && imageUrl ? (
                <AvatarImage 
                  src={imageUrl}
                  alt={name || "Unknown Coin"}
                  className="object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-800">
                  <Coins className="h-12 w-12 text-primary" />
                </div>
              )}
              <AvatarFallback className="bg-gray-800">
                <Coins className="h-12 w-12 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 sm:gap-4">
              <CopyAddressButton solanaAddr={mintAddress || ""} />
              <VoiceChatCounter coinId={id} />
              {twitter && (
                <a 
                  href={`https://twitter.com/${twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {website && (
                <a 
                  href={website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
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
            <MarketCapDisplay marketCap={price} usdMarketCap={marketCap} />
            <div className="text-sm text-gray-400">
              Price: {formatPrice(price)}
            </div>
            {description && (
              <p className="text-xs text-gray-400 line-clamp-2 text-center mt-2">
                {description}
              </p>
            )}
            {priceHistory && <MiniPriceChart data={priceHistory} />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}