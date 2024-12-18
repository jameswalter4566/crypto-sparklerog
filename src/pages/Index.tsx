import { CoinGrid } from "@/components/CoinGrid";
import { mockCoins } from "@/data/mockCoins";

const Index = () => {
  return (
    <div className="p-6">
      <CoinGrid coins={mockCoins} isLoading={false} />
    </div>
  );
};

export default Index;