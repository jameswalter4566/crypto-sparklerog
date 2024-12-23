import { useEffect, useState } from "react";

interface CoinPriceProps {
  initialPrice: number | null;
}

export function CoinPrice({ initialPrice }: CoinPriceProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(initialPrice);

  useEffect(() => {
    if (initialPrice === null || typeof initialPrice !== 'number' || isNaN(initialPrice)) {
      setCurrentPrice(null);
      return;
    }

    const interval = setInterval(() => {
      const fluctuation = initialPrice * (Math.random() * 0.002 - 0.001);
      setCurrentPrice(prev => prev !== null ? initialPrice + fluctuation : null);
    }, 2000);

    return () => clearInterval(interval);
  }, [initialPrice]);

  const formatPrice = (p: number | null) => {
    if (p === null || typeof p !== 'number' || isNaN(p)) {
      return 'Price not available';
    }
    return `Price SOL ${p.toFixed(6).replace('0.0', '0.0₅')}`;
  };

  return (
    <span className="text-lg sm:text-xl font-bold transition-all duration-300 text-center sm:text-left">
      {formatPrice(currentPrice)}
    </span>
  );
}