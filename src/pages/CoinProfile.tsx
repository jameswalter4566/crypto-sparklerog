import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - replace with real API data later
const coinData = {
  id: "bonk",
  name: "Bonk",
  symbol: "BONK",
  price: 0.00001234,
  change24h: 15.67,
  marketCap: 150000000,
  volume24h: 25000000,
  liquidity: 5000000,
};

const CoinProfile = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {coinData.name} ({coinData.symbol})
        </h1>
        <span className="text-2xl font-bold">${coinData.price.toFixed(8)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">${coinData.marketCap.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">${coinData.volume24h.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">${coinData.liquidity.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full h-[600px] mb-6">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400">
            Chart component will be implemented in the next iteration
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinProfile;