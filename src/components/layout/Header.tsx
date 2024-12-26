import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { Coins, Trophy, Search, Rocket, Star, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MenuItem {
  title: string;
  icon: React.ComponentType;
  path: string;
  external?: boolean;
}

export const Header = ({ onSearch, isLoading }: { 
  onSearch: (mintAddress: string) => Promise<any>;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  console.log("Header component rendered");

  const menuItems: MenuItem[] = [
    {
      title: "NODE",
      icon: Navigation,
      path: "https://nodecompany.fun",
      external: true,
    },
    {
      title: "Trending",
      icon: Coins,
      path: "/",
    },
    {
      title: "New",
      icon: Star,
      path: "/new-coins",
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

  const handleNavigation = (path: string, external?: boolean) => {
    console.log("Navigation triggered:", { path, external });
    if (external) {
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
            <img 
              src="/u1251571754_httpss.mj.runNz6izZD6Xoc_Create_me_a_four_letter__08879d3a-1b7c-44e1-aae1-8d48bb2ee55a_1.png" 
              alt="Logo" 
              className="h-16"
            />
            <div className="flex items-center gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path, item.external)}
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
        <div className="w-full max-w-xl mx-auto">
          <TokenSearchForm onSearch={onSearch} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};