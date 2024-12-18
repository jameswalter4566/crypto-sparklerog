import { useQuery } from "@tanstack/react-query";
import { CoinGrid } from "@/components/CoinGrid";
import { mockCoins } from "@/data/mockCoins";

const Index = () => {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCoins;
    }
  });

  return (
    <div className="p-6">
      <CoinGrid coins={coins || []} isLoading={isLoading} />
    </div>
  );
};

export default Index;