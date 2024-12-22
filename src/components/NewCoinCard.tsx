import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { CopyAddressButton } from "@/components/coin/CopyAddressButton";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  imageUrl?: string;
  mintAddress?: string;
}

export function NewCoinCard({ 
  id, 
  name, 
  symbol, 
  price, 
  change24h, 
  imageUrl,
  mintAddress 
}: NewCoinCardProps) {
  const [currentPrice, setCurrentPrice] = useState(price);

  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = price * (Math.random() * 0.002 - 0.001);
      setCurrentPrice(price + fluctuation);
    }, 2000);

    return () => clearInterval(interval);
  }, [price]);

  const formatPrice = (p: number) => {
    return `Price SOL ${p.toFixed(6).replace('0.0', '0.0₅')}`;
  };

  const symbolFallback = symbol ? symbol.slice(0, 2) : "??";

  return (
    <a href={`/coin/${id}`} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="hover:bg-gray-900 transition-colors h-full">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-72 lg:w-72">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} className="object-cover" />
              <AvatarFallback className="text-2xl">{symbolFallback}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-base sm:text-lg flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{name}</span>
                <CopyAddressButton solanaAddr={mintAddress} />
              </div>
              <span className="text-sm text-gray-400">{symbol}</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-lg sm:text-xl font-bold transition-all duration-300 text-center sm:text-left">
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
    </a>
  );
};