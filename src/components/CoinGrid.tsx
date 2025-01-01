import { NewCoinCard } from "./NewCoinCard";
import { CoinGridHeader } from "./coin/CoinGridHeader";
import { useTrendingCoins } from "@/hooks/useTrendingCoins";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useRef, useEffect } from "react";

interface CoinGridProps {
  title?: string;
  coins?: Array<{
    id: string;
    name: string;
    imageUrl: string;
    usdMarketCap: number;
    description?: string;
  }>;
  isLoading?: boolean;
}

export function CoinGrid({ title = "Trending Coins", coins: propCoins, isLoading: propIsLoading }: CoinGridProps) {
  const { coins: fetchedCoins, isLoading: queryIsLoading } = useTrendingCoins();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const gridRef = useRef<HTMLDivElement>(null);

  const isLoadingData = propIsLoading ?? queryIsLoading;
  const unsortedCoins = propCoins ?? fetchedCoins;

  const sortedCoins = useMemo(() => {
    if (!unsortedCoins) return [];
    return [...unsortedCoins].sort((a, b) => {
      const aMarketCap = a.usdMarketCap || 0;
      const bMarketCap = b.usdMarketCap || 0;
      return sortOrder === 'desc' ? bMarketCap - aMarketCap : aMarketCap - bMarketCap;
    });
  }, [unsortedCoins, sortOrder]);

  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        const newEnd = Math.min(visibleRange.end + 10, sortedCoins.length);
        if (newEnd > visibleRange.end) {
          setVisibleRange(prev => ({ ...prev, end: newEnd }));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sortedCoins.length, visibleRange.end]);

  if (isLoadingData) {
    return (
      <div className="w-full max-w-[2000px] mx-auto px-4 space-y-6">
        <CoinGridHeader title={title} onSort={setSortOrder} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="h-[400px]">
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sortedCoins || sortedCoins.length === 0) {
    return (
      <div className="w-full max-w-[2000px] mx-auto px-4 space-y-6">
        <CoinGridHeader title={title} onSort={setSortOrder} />
        <div className="text-center text-gray-500">No coins found</div>
      </div>
    );
  }

  const visibleCoins = sortedCoins.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="w-full max-w-[2000px] mx-auto px-4 space-y-6">
      <CoinGridHeader title={title} onSort={setSortOrder} />
      <div 
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      >
        {visibleCoins.map((coin) => {
          if (!coin || !coin.id) {
            console.warn('Invalid coin data:', coin);
            return null;
          }

          return (
            <NewCoinCard
              key={coin.id}
              id={coin.id}
              name={coin.name || "Unknown Coin"}
              usdMarketCap={typeof coin.usdMarketCap === "number" && !isNaN(coin.usdMarketCap) ? coin.usdMarketCap : null}
              imageUrl={coin.imageUrl || "/placeholder.svg"}
              description={coin.description}
            />
          );
        })}
      </div>
    </div>
  );
}