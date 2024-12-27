import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { Coins, Trophy, Search, Rocket, Compass, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  isSpecial?: boolean;
}

export const Header = ({ onSearch, isLoading }: { 
  onSearch: (mintAddress: string) => Promise<any>;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  console.log("Header component rendered");

  const handleLogoClick = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      navigate('/');
    }, 1000); // Wait for spin animation to complete
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
  ];

  const handleNavigation = (path: string) => {
    console.log("Navigation triggered:", { path });
    navigate(path);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-24 bg-black/50 backdrop-blur-sm z-20">
      <div className="flex flex-col gap-4 h-full px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/swaplogoofficial.jpg" 
              alt="Logo" 
              className={`h-12 w-12 object-cover cursor-pointer animate-glow-pulse rounded-full
                ${isSpinning ? 'animate-[spin_1s_linear]' : ''}
                transition-all duration-300 hover:scale-105`}
              onClick={handleLogoClick}
            />
            <div className="flex items-center gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
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