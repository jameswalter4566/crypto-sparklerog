import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Index from "./pages/Index";
import CoinProfile from "./pages/CoinProfile";
import CoinSearch from "./pages/CoinSearch";
import LaunchCoin from "./pages/LaunchCoin";
import RocketLaunch from "./pages/RocketLaunch";

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
            <main className="flex-1">
              <div className="h-20 fixed top-0 right-0 left-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-between px-4">
                <img 
                  src="/u1251571754_Create_me_a_serious_looking_tech_themed_logo_for__dcc6bed4-3b70-4fc5-9619-86576ba3fc1f_3.png" 
                  alt="Logo" 
                  className="h-12 w-auto"
                />
                <div className="flex items-center gap-4">
                  <WalletConnect />
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      A
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="h-20"></div>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/coin/:id" element={<CoinProfile />} />
                <Route path="/search" element={<CoinSearch />} />
                <Route path="/launch" element={<LaunchCoin />} />
                <Route path="/rocket-launch" element={<RocketLaunch />} />
                <Route path="/leaderboard" element={<div className="p-6">Leaderboard Coming Soon</div>} />
                <Route path="/holdings" element={<div className="p-6">Holdings Coming Soon</div>} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;