import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  imageUrl?: string;
}

export function NewCoinCard({ id, name, symbol, price, change24h, imageUrl }: NewCoinCardProps) {
  const [currentPrice, setCurrentPrice] = useState(price);

  useEffect(() => {
    // Update price every 2 seconds with a small random fluctuation
    const interval = setInterval(() => {
      const fluctuation = price * (Math.random() * 0.002 - 0.001); // ±0.1% fluctuation
      setCurrentPrice(price + fluctuation);
    }, 2000);

    return () => clearInterval(interval);
  }, [price]);

  // Format price to SOL style
  const formatPrice = (p: number) => {
    return `Price SOL ${p.toFixed(6).replace('0.0', '0.0₅')}`;
  };

  // Safely get the first two characters of the symbol for the fallback
  const symbolFallback = symbol ? symbol.slice(0, 2) : "??";

  return (
    <Link to={`/coin/${id}`}>
      <Card className="hover:bg-gray-900 transition-colors">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-72 w-72">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="text-2xl">{symbolFallback}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg flex flex-col items-center gap-1">
              <span>{name}</span>
              <span className="text-sm text-gray-400">{symbol}</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold transition-all duration-300">
              {formatPrice(currentPrice)}
            </span>
            <span
              className={`${
                change24h >= 0 ? "text-secondary" : "text-red-500"
              } font-semibold`}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}