import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { cardColors } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Coins } from "lucide-react";
import { VoiceChatCounter } from "./coin/VoiceChatCounter";

interface NewCoinCardProps {
  id: string;
  name: string;
  usdMarketCap?: number | null;
  imageUrl?: string;
  description?: string | null;
  symbol?: string;
  price?: number | null;
  change24h?: number | null;
  mintAddress?: string;
}

export function NewCoinCard({ 
  id, 
  name,
  usdMarketCap: initialMarketCap,
  imageUrl,
  description
}: NewCoinCardProps) {
  const [marketCap, setMarketCap] = useState<number | null>(initialMarketCap);
  const [imageError, setImageError] = useState(false);
  const [currentColor, setCurrentColor] = useState('#F97316');
  
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
            const newMarketCap = payload.new.usd_market_cap;
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
  }, [id, marketCap]);

  useEffect(() => {
    const colors = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];
    let colorIndex = 0;

    const interval = setInterval(() => {
      setCurrentColor(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % colors.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatUsdMarketCap = (value: number | null) => {
    if (!value || isNaN(value)) {
      return "";
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M MK`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K MK`;
    }
    return `$${value.toFixed(2)} MK`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/coin/${id}`} className="block w-full">
      <Card 
        className={cn(
          "h-[400px] min-w-[280px] border-2 border-primary/50 relative transition-transform hover:scale-105 duration-300",
          "hover:bg-gray-900"
        )}
        style={{ backgroundColor: cardColor }}
      >
        <CardHeader className="p-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 bg-gray-800">
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
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-4">
            <CardTitle className="text-lg">
              <div className="truncate max-w-[200px] text-center" title={name || "Unnamed Coin"}>
                {name || "Unnamed Coin"}
              </div>
            </CardTitle>
            
            <div className="text-xl font-bold" style={{ color: currentColor }}>
              {formatUsdMarketCap(marketCap)}
            </div>

            {description && (
              <p className="text-sm text-gray-400 line-clamp-2 text-center mt-2 px-2">
                {description}
              </p>
            )}

            <div className="mt-2">
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}