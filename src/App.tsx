import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";
import Index from "./pages/Index";
import CoinProfile from "./pages/CoinProfile";
import CoinSearch from "./pages/CoinSearch";
import LaunchCoin from "./pages/LaunchCoin";
import RocketLaunch from "./pages/RocketLaunch";
import NewCoins from "./pages/NewCoins";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-black text-white">
            <AppSidebar />
            <main className="flex-1 overflow-x-hidden">
              <div className="fixed top-0 left-0 right-0 h-14 sm:h-16 md:h-20 bg-black/50 backdrop-blur-sm z-20 flex items-center px-2 sm:px-4">
                <img 
                  src="/u1251571754_Create_me_a_serious_looking_tech_themed_logo_for__dcc6bed4-3b70-4fc5-9619-86576ba3fc1f_3.png" 
                  alt="Logo" 
                  className="h-12 sm:h-14 md:h-20 ml-2 sm:ml-4 md:ml-16 hidden md:block"
                />
                <img 
                  src="/u1251571754_Create_me_a_serious_looking_tech_themed_logo_for__dcc6bed4-3b70-4fc5-9619-86576ba3fc1f_3.png" 
                  alt="Logo" 
                  className="h-10 sm:h-12 ml-2 sm:ml-4 md:hidden"
                />
              </div>
              <div className="h-14 sm:h-16 md:h-20"></div>
              <div className="z-30 relative">
                <WalletConnect />
              </div>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/new-coins" element={<NewCoins />} />
                <Route path="/coin/:id" element={<CoinProfile />} />
                <Route path="/search" element={<CoinSearch />} />
                <Route path="/launch" element={<LaunchCoin />} />
                <Route path="/rocket-launch" element={<RocketLaunch />} />
                <Route path="/leaderboard" element={<div className="p-4 sm:p-6">Leaderboard Coming Soon</div>} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;