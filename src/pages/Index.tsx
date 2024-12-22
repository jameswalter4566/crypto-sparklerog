import { CoinGrid } from "@/components/CoinGrid";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (mintAddress: string) => {
    if (mintAddress) {
      navigate(`/coin/${mintAddress}`);
    }
  };

  return (
    <div className="container mx-auto py-2 sm:py-4 max-w-[2000px] space-y-3 sm:space-y-4">
      <WelcomeDialog />
      <div className="px-2">
        <TokenSearchForm onSearch={handleSearch} isLoading={false} />
      </div>
      <CoinGrid />
    </div>
  );
};

export default Index;