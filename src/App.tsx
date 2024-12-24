import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";
import { TokenSearchForm } from "@/components/coin/TokenSearchForm";
import Index from "./pages/Index";
import CoinProfile from "./pages/CoinProfile";
import CoinSearch from "./pages/CoinSearch";
import LaunchCoin from "./pages/LaunchCoin";
import RocketLaunch from "./pages/RocketLaunch";
import NewCoins from "./pages/NewCoins";
import { useToast } from "./hooks/use-toast";
import { supabase } from "./integrations/supabase/client";
import { useState } from "react";

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
      return;
    }

    setIsLoading(true);
    try {
      // Fetch existing coin from the database
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

      // If the coin does not exist, call the Edge Function to add it
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

      // Update search count and show success message
      if (coinMetadata) {
        await updateSearchCount(coinMetadata.id);
        window.location.href = `/coin/${coinMetadata.id}`;
        toast({
          title: "Success",
          description: `${coinMetadata.name} found successfully.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch token information.",
        variant: "destructive",
      });
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
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-black text-white">
              <AppSidebar />
              <main className="flex-1 overflow-x-hidden">
                <div className="fixed top-0 left-0 right-0 h-14 sm:h-16 md:h-20 bg-black/50 backdrop-blur-sm z-20">
                  <div className="flex items-center h-full px-2 sm:px-4 gap-2 sm:gap-4">
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
                    <div className="flex-1 max-w-2xl mx-auto">
                      <TokenSearchForm onSearch={handleSearch} isLoading={isLoading} />
                    </div>
                  </div>
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
};

export default App;