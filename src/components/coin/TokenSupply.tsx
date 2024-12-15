import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenSupplyProps {
  total: number | null;
  circulating: number | null;
  nonCirculating: number | null;
}

export const TokenSupply = ({ total, circulating, nonCirculating }: TokenSupplyProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Total Supply</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {total?.toLocaleString() ?? "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Circulating Supply</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {circulating?.toLocaleString() ?? "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Non-Circulating Supply</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {nonCirculating?.toLocaleString() ?? "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};