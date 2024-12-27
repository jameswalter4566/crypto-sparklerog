import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { Coins, Trophy, Search, Rocket, Compass, ArrowLeftRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  isSpecial?: boolean;
  isExternal?: boolean;
}

export const Header = ({ onSearch, isLoading }: { 
  onSearch: (mintAddress: string) => Promise<any>;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleLogoClick = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      navigate('/');
    }, 1000);
  };

  const menuItems: MenuItem[] = [
    {
      title: "SWAP",
      icon: ArrowLeftRight,
      path: "/swap",
      isSpecial: true,
    },
    {
      title: "Trending",
      icon: Coins,
      path: "/",
    },
    {
      title: "Explore",
      icon: Compass,
      path: "/explore",
    },
    {
      title: "Search",
      icon: Search,
      path: "/search",
    },
    {
      title: "Launch",
      icon: Rocket,
      path: "/launch",
    },
    {
      title: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
    },
    {
      title: "Community",
      icon: Users,
      path: "https://x.com/SwapSolDotFun",
      isExternal: true,
    },
  ];

  const handleNavigation = (path: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-24 bg-black/50 backdrop-blur-sm z-20">
      <div className="flex flex-col gap-4 h-full px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-primary/10">
              <img 
                src="/swaplogoofficial.jpg" 
                alt="Logo" 
                className={`h-14 w-14 object-contain cursor-pointer
                  ${isSpinning ? 'animate-logo-spin' : ''}
                  transition-all duration-300 hover:scale-105
                  shadow-[0_0_20px_rgba(249,115,22,0.5)]`}
                onClick={handleLogoClick}
              />
            </div>
            <div className="flex items-center gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path, item.isExternal)}
                  className={`flex items-center gap-2 font-bold tracking-wide text-sm transition-all duration-300 hover:text-primary ${
                    item.isSpecial 
                      ? 'text-primary font-["3D_Cyborg"] text-xl tracking-[0.25em] scale-125 animate-laser-glow uppercase' 
                      : ''
                  }`}
                >
                  <item.icon className={`${item.isSpecial ? 'h-6 w-6' : 'h-4 w-4'}`} />
                  <span className="hidden sm:inline">{item.title}</span>
                </Button>
              ))}
            </div>
          </div>
          <WalletConnect />
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <TokenSearchForm onSearch={onSearch} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};