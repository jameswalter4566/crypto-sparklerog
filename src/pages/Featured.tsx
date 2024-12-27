import { CoinGrid } from "@/components/CoinGrid";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { MovingBanners } from "@/components/effects/MovingBanners";

const Featured = () => {
  return (
    <>
      <AnimatedBackground />
      <MovingBanners />
      <div className="container mx-auto py-2 px-2 sm:py-4 sm:px-4 max-w-[2000px] space-y-3 sm:space-y-4">
        <CoinGrid title="Featured New Coins" />
      </div>
    </>
  );
};

export default Featured;