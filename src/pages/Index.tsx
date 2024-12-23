import { CoinGrid } from "@/components/CoinGrid";
import { SearchSection } from "@/components/home/SearchSection";
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
      <SearchSection onSearch={handleSearch} isLoading={false} />
      <CoinGrid />
    </div>
  );
};

export default Index;