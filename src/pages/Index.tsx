import { CoinGrid } from "@/components/CoinGrid";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { useNavigate } from "react-router-dom";
import { WelcomeDialog } from "@/components/WelcomeDialog";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (mintAddress: string) => {
    if (mintAddress) {
      navigate(`/coin/${mintAddress}`);
    }
  };

  return (
    <div className="container mx-auto py-2 sm:py-4 max-w-[2000px] space-y-4 sm:space-y-6">
      <WelcomeDialog />
      <div className="px-2 sm:px-4">
        <TokenSearchForm onSearch={handleSearch} isLoading={false} />
      </div>
      <CoinGrid />
    </div>
  );
};

export default Index;