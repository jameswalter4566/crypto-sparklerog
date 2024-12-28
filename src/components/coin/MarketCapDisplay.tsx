import { useEffect, useState } from "react";
import { priceColors } from "@/constants/colors";

interface MarketCapDisplayProps {
  marketCap: number | null;
  usdMarketCap: number | null;
}

export const MarketCapDisplay = ({ marketCap, usdMarketCap }: MarketCapDisplayProps) => {
  const [currentColor, setCurrentColor] = useState(priceColors[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * priceColors.length);
      setCurrentColor(priceColors[randomIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatMarketCap = (value: number | null) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "MC not available";
    }
    return `SOL ${value.toFixed(6)}`;
  };

  const formatUsdMarketCap = (value: number | null) => {
    if (value === null || isNaN(value)) {
      return "";
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="text-lg sm:text-xl font-medium truncate max-w-[140px] sm:max-w-[180px] transition-colors duration-300">
      <span className="text-sm text-gray-400">
        {formatMarketCap(marketCap)}
      </span>
      <span className="ml-1" style={{ color: currentColor }}>
        {formatUsdMarketCap(usdMarketCap)}
      </span>
    </div>
  );
};