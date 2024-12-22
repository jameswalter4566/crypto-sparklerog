import { useEffect, useState } from "react";

interface CoinPriceProps {
  initialPrice: number;
}

export function CoinPrice({ initialPrice }: CoinPriceProps) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);

  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = initialPrice * (Math.random() * 0.002 - 0.001);
      setCurrentPrice(initialPrice + fluctuation);
    }, 2000);

    return () => clearInterval(interval);
  }, [initialPrice]);

  const formatPrice = (p: number) => {
    return `Price SOL ${p.toFixed(6).replace('0.0', '0.0₅')}`;
  };

  return (
    <span className="text-lg sm:text-xl font-bold transition-all duration-300 text-center sm:text-left">
      {formatPrice(currentPrice)}
    </span>
  );
}