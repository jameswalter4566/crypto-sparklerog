import { Card, CardContent } from "@/components/ui/card";
import { NewCoinCard } from "@/components/NewCoinCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const mockCoins = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 45000,
    change_24h: 2.5
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 3000,
    change_24h: 1.8
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 100,
    change_24h: 5.2
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 1.2,
    change_24h: -0.8
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    price: 24.5,
    change_24h: 3.2
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    price: 85.3,
    change_24h: 4.7
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    price: 15.8,
    change_24h: -1.2
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    price: 1.45,
    change_24h: 2.1
  },
  {
    id: "uniswap",
    name: "Uniswap",
    symbol: "UNI",
    price: 7.8,
    change_24h: -0.5
  },
  {
    id: "aave",
    name: "Aave",
    symbol: "AAVE",
    price: 180.6,
    change_24h: 1.9
  },
  {
    id: "cosmos",
    name: "Cosmos",
    symbol: "ATOM",
    price: 28.4,
    change_24h: 3.7
  },
  {
    id: "algorand",
    name: "Algorand",
    symbol: "ALGO",
    price: 0.95,
    change_24h: -2.3
  }
];

const Index = () => {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCoins;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {coins?.map((coin) => (
          <Card key={coin.id}>
            <CardContent className="pt-6">
              <NewCoinCard
                id={coin.id}
                name={coin.name}
                symbol={coin.symbol}
                price={coin.price || 0}
                change24h={coin.change_24h || 0}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;