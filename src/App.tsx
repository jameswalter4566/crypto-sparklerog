import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import { useNavigate } from "react-router-dom";
import { Coins, Trophy, Search, Rocket, Star, Navigation } from "lucide-react";
import Index from "./pages/Index";
import CoinProfile from "./pages/CoinProfile";
import CoinSearch from "./pages/CoinSearch";
import LaunchCoin from "./pages/LaunchCoin";
import RocketLaunch from "./pages/RocketLaunch";
import NewCoins from "./pages/NewCoins";
import { useToast } from "./hooks/use-toast";
import { supabase } from "./integrations/supabase/client";
import { useState } from "react";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
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
    if (external) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  const updateSearchCount = async (coinId: string) => {
    console.log('Updating search count for coin:', coinId);
    
    const { data: currentData, error: fetchError } = await supabase
      .from('coin_searches')
      .select('search_count')
      .eq('coin_id', coinId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current search count:', fetchError);
      return;
    }

    const currentCount = currentData?.search_count || 0;
    const newCount = currentCount + 1;

    const { error: upsertError } = await supabase
      .from('coin_searches')
      .upsert(
        { 
          coin_id: coinId,
          last_searched_at: new Date().toISOString(),
          search_count: newCount
        },
        {
          onConflict: 'coin_id'
        }
      );

    if (upsertError) {
      console.error('Error updating search count:', upsertError);
    } else {
      console.log('Successfully updated search count to:', newCount);
    }
  };

  const handleSearch = async (mintAddress: string) => {
    if (!mintAddress) {
      toast({
        title: "Error",
        description: "Please enter a mint address.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data: existingCoin, error: selectError } = await supabase
        .from("coins")
        .select("*")
        .eq("id", mintAddress)
        .maybeSingle();

      if (selectError) {
        console.error("Select Error:", selectError);
        throw new Error("Failed to check existing coin data.");
      }

      let coinMetadata = existingCoin;

      if (!coinMetadata) {
        const functionUrl = "https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/add-coin";

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ solana_addr: mintAddress }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Edge Function Error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        coinMetadata = result;
      }

      if (coinMetadata) {
        await updateSearchCount(coinMetadata.id);
        toast({
          title: "Success",
          description: `${coinMetadata.name} found successfully.`,
          variant: "default",
        });
        return coinMetadata;
      }
      return null;
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch token information.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex w-full bg-black text-white">
            <main className="flex-1 overflow-x-hidden">
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
                    <TokenSearchForm onSearch={handleSearch} isLoading={isLoading} />
                  </div>
                </div>
              </div>
              <div className="h-24"></div>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/new-coins" element={<NewCoins />} />
                <Route path="/coin/:id" element={<CoinProfile />} />
                <Route path="/search" element={<CoinSearch />} />
                <Route path="/launch" element={<LaunchCoin />} />
                <Route path="/rocket-launch" element={<RocketLaunch />} />
                <Route path="/leaderboard" element={<div className="p-4 sm:p-6">Leaderboard Coming Soon</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
