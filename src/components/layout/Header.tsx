import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { Coins, Search, Rocket, Compass, ArrowLeftRight, Twitter, Star, Video, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogoClick = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      navigate('/');
    }, 1000);
  };

  const menuItems: MenuItem[] = [
    {
      title: "SMART",
      icon: ArrowLeftRight,
      path: "/swap",
      isSpecial: true,
    },
    {
      title: "New Coins",
      icon: Coins,
      path: "/",
    },
    {
      title: "Featured",
      icon: Star,
      path: "/featured",
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
      title: "Live Stream",
      icon: Video,
      path: "/live-stream",
    },
    {
      title: "Community Updates",
      icon: Twitter,
      path: "https://x.com/SwapSolDotFun",
      isExternal: true,
    },
  ];

  const handleNavigation = (path: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      navigate(path);
      setIsOpen(false);
    }
  };

  const MenuContent = () => (
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
          <span className={`${!item.isSpecial && 'hidden sm:inline'}`}>{item.title}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 h-24 md:h-24 bg-black/50 backdrop-blur-sm z-20">
      <div className="flex flex-col gap-2 md:gap-4 h-full px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-primary/10">
              <img 
                src="/u1251571754_httpss.mj.run7UlNVv_PHZg_Create_a_HD_version_of_t_e4c06ff0-02a0-4364-bbe7-c72d5d148770_3.png" 
                alt="Logo" 
                className={`h-14 w-14 object-contain cursor-pointer
                  ${isSpinning ? 'animate-logo-spin' : ''}
                  transition-all duration-300 hover:scale-105
                  shadow-[0_0_20px_rgba(249,115,22,0.5)]`}
                onClick={handleLogoClick}
              />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex">
              <MenuContent />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-black/90 backdrop-blur-lg border-r border-primary/20">
                  <nav className="flex flex-col gap-4 mt-8">
                    {menuItems.map((item) => (
                      <Button
                        key={item.title}
                        variant="ghost"
                        size="lg"
                        onClick={() => handleNavigation(item.path, item.isExternal)}
                        className={`w-full justify-start gap-4 font-bold tracking-wide text-lg ${
                          item.isSpecial 
                            ? 'text-primary font-["3D_Cyborg"] tracking-[0.25em] animate-laser-glow uppercase' 
                            : ''
                        }`}
                      >
                        <item.icon className={`${item.isSpecial ? 'h-6 w-6' : 'h-5 w-5'}`} />
                        {item.title}
                      </Button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <WalletConnect />
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <TokenSearchForm onSearch={onSearch} isLoading={isLoading} isMobileHeader={isMobile} />
        </div>
      </div>
    </div>
  );
};