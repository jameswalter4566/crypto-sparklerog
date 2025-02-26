import { CoinGrid } from "@/components/CoinGrid";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { MovingBanners } from "@/components/effects/MovingBanners";
import { useFeaturedCoins } from "@/hooks/useFeaturedCoins";
import { WelcomeDialog } from "@/components/WelcomeDialog";

const Featured = () => {
  const { coins, isLoading } = useFeaturedCoins();

  return (
    <>
      <AnimatedBackground />
      <MovingBanners />
      <div className="container mx-auto py-2 px-2 sm:py-4 sm:px-4 max-w-[2000px] space-y-3 sm:space-y-4">
        <WelcomeDialog />
        <CoinGrid 
          title="Featured" 
          coins={coins}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default Featured;