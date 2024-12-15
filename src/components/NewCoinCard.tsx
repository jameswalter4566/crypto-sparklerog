import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

export function NewCoinCard({ id, name, symbol, price, change24h }: NewCoinCardProps) {
  return (
    <Link to={`/coin/${id}`}>
      <Card className="hover:bg-gray-900 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg`} alt={name} />
              <AvatarFallback>{symbol.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex justify-between items-center w-full">
              <span>{name}</span>
              <span className="text-sm text-gray-400">{symbol}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">${price.toFixed(4)}</span>
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