import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

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
          <CardTitle className="text-lg flex justify-between items-center">
            <span>{name}</span>
            <span className="text-sm text-gray-400">{symbol}</span>
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