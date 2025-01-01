import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SmartLogo } from "./SmartLogo";
import { NavigationMenu } from "./NavigationMenu";
import { MobileMenu } from "./MobileMenu";

export const Header = ({
  onSearch,
  isLoading,
}: {
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

  const MenuContent = () => (
    <div className="flex items-center gap-1">
      <SmartLogo />
      <NavigationMenu />
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
            <div className="h-20 w-20 overflow-hidden rounded-full bg-primary/10">
              <img 
                src="/swaplogoofficial.jpg" 
                alt="Logo" 
                className={`h-20 w-20 object-contain cursor-pointer
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
              <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};