import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistance } from "date-fns";

// Mock data - replace with real API data later
const newCoins = [
  {
    id: "bonk",
    name: "Bonk",
    symbol: "BONK",
    created: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    liquidity: 62533.15,
    initialLiquidity: 15000,
    marketCap: 84620,
    transactions: 4,
    volume: 2181,
    priceChange: 4.62,
  },
  {
    id: "myro",
    name: "Myro",
    symbol: "MYRO",
    created: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    liquidity: 67800.50,
    initialLiquidity: 15000,
    marketCap: 57950,
    transactions: 5,
    volume: 4564,
    priceChange: -5.43,
  },
  {
    id: "dogwifhat",
    name: "dogwifhat",
    symbol: "WIF",
    created: new Date(Date.now() - 1000 * 60 * 60 * 16), // 16 hours ago
    liquidity: 81047.25,
    initialLiquidity: 15000,
    marketCap: 111300,
    transactions: 12,
    volume: 2139,
    priceChange: 25.89,
  },
];

const Index = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">New Pairs</h1>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Liquidity</TableHead>
              <TableHead>Initial Liquidity</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Txns</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Price Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newCoins.map((coin) => (
              <TableRow key={coin.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{coin.name}</span>
                    <span className="text-sm text-muted-foreground">${coin.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDistance(coin.created, new Date(), { addSuffix: true })}</TableCell>
                <TableCell>${coin.liquidity.toLocaleString()}</TableCell>
                <TableCell>${coin.initialLiquidity.toLocaleString()}</TableCell>
                <TableCell>${coin.marketCap.toLocaleString()}</TableCell>
                <TableCell>{coin.transactions}</TableCell>
                <TableCell>${coin.volume.toLocaleString()}</TableCell>
                <TableCell className={coin.priceChange >= 0 ? "text-secondary" : "text-red-500"}>
                  {coin.priceChange >= 0 ? "+" : ""}
                  {coin.priceChange.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;