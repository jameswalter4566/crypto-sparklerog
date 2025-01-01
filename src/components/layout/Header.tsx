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

  return (
    <header className="fixed top-0 left-0 right-0 bg-black border-b border-primary/20 z-[9999] shadow-lg select-none">
      <div className="max-w-[2000px] mx-auto">
        <div className="flex flex-col gap-2 px-4 py-3">
          {/* Top Row - Logo, Navigation, and Wallet */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
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
              
              <SmartLogo />
              
              {/* Desktop Menu */}
              <div className="hidden md:flex overflow-x-auto">
                <NavigationMenu />
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
              </div>
            </div>

            {/* Wallet Connect - Always visible */}
            <div className="flex-shrink-0">
              <WalletConnect />
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="w-full max-w-2xl mx-auto">
            <TokenSearchForm onSearch={onSearch} isLoading={isLoading} isMobileHeader={isMobile} />
          </div>
        </div>
      </div>
    </header>
  );
};