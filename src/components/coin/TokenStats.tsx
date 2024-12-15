import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenStatsProps {
  marketCap: number | null;
  volume24h: number | null;
  liquidity: number | null;
}

export const TokenStats = ({ marketCap, volume24h, liquidity }: TokenStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            ${marketCap?.toLocaleString() ?? "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            ${volume24h?.toLocaleString() ?? "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            ${liquidity?.toLocaleString() ?? "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};