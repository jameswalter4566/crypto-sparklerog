import { useEffect, useState } from "react";
import { priceColors } from "@/constants/colors";

interface CoinPriceDisplayProps {
  price: number | null;
  formatPrice: (price: number | null) => string;
}

export const CoinPriceDisplay = ({ price, formatPrice }: CoinPriceDisplayProps) => {
  const [currentPriceColor, setCurrentPriceColor] = useState(priceColors[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * priceColors.length);
      setCurrentPriceColor(priceColors[randomIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="mt-1 text-lg sm:text-xl font-medium truncate max-w-[140px] sm:max-w-[180px] transition-colors duration-300"
      style={{ color: currentPriceColor }}
    >
      {formatPrice(price)}
    </div>
  );
};