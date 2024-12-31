import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { Coins, Search, Rocket, Compass, Twitter, Star, Video, Menu } from "lucide-react";
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

  const SmartLogo = () => (
    <div className="flex items-center space-x-[1px] font-bold text-2xl">
      {['S', 'M', 'A', 'R', 'T'].map((letter, index) => (
        <span
          key={index}
          className="animate-glow-pulse text-white font-['3D_Cyborg']"
          style={{
            textShadow: `
              0 0 7px #F97316,
              0 0 10px #F97316,
              0 0 21px #F97316
            `
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  );

  const MenuContent = () => (
    <div className="flex items-center gap-1">
      <SmartLogo />
      {menuItems.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation(item.path, item.isExternal)}
          className="flex items-center gap-2 font-bold tracking-wide text-sm transition-all duration-300 hover:text-primary"
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{item.title}</span>
        </Button>
      ))}
      <div className="ml-2 w-[600px]">
        <TokenSearchForm onSearch={onSearch} isLoading={isLoading} isMobileHeader={isMobile} />
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-primary/20 z-[9999] shadow-lg select-none">
      <div className="flex flex-col gap-2 md:gap-2 h-full px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-primary/10">
              <img 
                src="/swaplogoofficial.jpg" 
                alt="Logo" 
                className={`h-10 w-10 object-contain cursor-pointer
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
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-black border-r border-primary/20">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => handleNavigation('/swap')}
                      className="w-full justify-start gap-2 font-bold tracking-wide text-lg"
                    >
                      <SmartLogo />
                    </Button>
                    {menuItems.map((item) => (
                      <Button
                        key={item.title}
                        variant="ghost"
                        size="lg"
                        onClick={() => handleNavigation(item.path, item.isExternal)}
                        className="w-full justify-start gap-4 font-bold tracking-wide text-lg"
                      >
                        <item.icon className="h-4 w-4" />
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
      </div>
    </header>
  );
};
