import { CoinGrid } from "@/components/CoinGrid";
import { mockCoins } from "@/data/mockCoins";

const Index = () => {
  return (
    <div className="container py-8">
      <CoinGrid coins={mockCoins} isLoading={false} />
    </div>
  );
};

export default Index;