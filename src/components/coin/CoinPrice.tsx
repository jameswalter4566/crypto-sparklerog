import { useEffect, useState } from "react";

interface CoinPriceProps {
  initialPrice: number | null;
}

export function CoinPrice({ initialPrice }: CoinPriceProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(initialPrice);

  useEffect(() => {
    if (typeof initialPrice !== "number" || isNaN(initialPrice) || initialPrice === null) {
      setCurrentPrice(null);
      return;
    }

    const interval = setInterval(() => {
      const fluctuation = initialPrice * (Math.random() * 0.002 - 0.001);
      const newPrice = initialPrice + fluctuation;
      setCurrentPrice(typeof newPrice === "number" && !isNaN(newPrice) ? newPrice : null);
    }, 2000);

    return () => clearInterval(interval);
  }, [initialPrice]);

  const formatPrice = (price: number | null): string => {
    if (typeof price !== "number" || isNaN(price)) {
      return "Price not available";
    }
    return `Price SOL ${price.toFixed(6)}`;
  };

  return (
    <span className="text-lg sm:text-xl font-bold text-center sm:text-left">
      {formatPrice(currentPrice)}
    </span>
  );
}
