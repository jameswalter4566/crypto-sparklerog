import { NewCoinCard } from "@/components/NewCoinCard";

// Mock data - replace with real API data later
const newCoins = [
  {
    id: "bonk",
    name: "Bonk",
    symbol: "BONK",
    price: 0.00001234,
    change24h: 15.67,
  },
  {
    id: "myro",
    name: "Myro",
    symbol: "MYRO",
    price: 0.00004567,
    change24h: -5.43,
  },
  {
    id: "dogwifhat",
    name: "dogwifhat",
    symbol: "WIF",
    price: 0.00098765,
    change24h: 25.89,
  },
];

const Index = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        New Coins
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newCoins.map((coin) => (
          <NewCoinCard key={coin.id} {...coin} />
        ))}
      </div>
    </div>
  );
};

export default Index;