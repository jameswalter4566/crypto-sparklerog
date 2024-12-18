import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  imageUrl?: string;
}

export function NewCoinCard({ id, name, symbol, price, change24h, imageUrl }: NewCoinCardProps) {
  return (
    <Link to={`/coin/${id}`}>
      <Card className="hover:bg-gray-900 transition-colors">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-72 w-72">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="text-2xl">{symbol.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg flex flex-col items-center gap-1">
              <span>{name}</span>
              <span className="text-sm text-gray-400">{symbol}</span>
            </CardTitle>
          </div>
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