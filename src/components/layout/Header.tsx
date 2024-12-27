import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { Coins, Trophy, Search, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
}

export const Header = ({ onSearch, isLoading }: { 
  onSearch: (mintAddress: string) => Promise<any>;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  console.log("Header component rendered");

  const menuItems: MenuItem[] = [
    {
      title: "Trending",
      icon: Coins,
      path: "/",
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
              src="/swap-high-resolution-logo.png" 
              alt="Logo" 
              className="h-16 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-2 font-bold tracking-wide text-sm transition-all duration-300 hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
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