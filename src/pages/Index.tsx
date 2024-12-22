import { CoinGrid } from "@/components/CoinGrid";
import { SwapInterface } from "@/components/SwapInterface";

const Index = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <SwapInterface />
      </div>
      <CoinGrid />
    </div>
  );
};

export default Index;