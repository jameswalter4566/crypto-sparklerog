import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { GridOverlay } from "@/components/effects/GridOverlay";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Featured from "./pages/Featured";
import CoinProfile from "./pages/CoinProfile";
import CoinSearch from "./pages/CoinSearch";
import LaunchCoin from "./pages/LaunchCoin";
import RocketLaunch from "./pages/RocketLaunch";
import NewCoins from "./pages/NewCoins";
import { useToast } from "./hooks/use-toast";
import { supabase } from "./integrations/supabase/client";
import { useState } from "react";
import { priceColors } from "./constants/colors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => {
  console.log("App component rendered");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getRandomColor = () => {
    return priceColors[Math.floor(Math.random() * priceColors.length)];
  };

  const updateSearchCount = async (coinId: string) => {
    console.log('Updating search count for coin:', coinId);
    
    try {
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
    } catch (error) {
      console.error('Error in updateSearchCount:', error);
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
      // First check if the coin exists in our database
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
        // If coin doesn't exist, call the edge function to add it
        const response = await supabase.functions.invoke('add-coin', {
          body: { solana_addr: mintAddress }
        });

        if (!response.data) {
          throw new Error('Failed to fetch token information from edge function');
        }

        coinMetadata = response.data;
      }

      if (coinMetadata) {
        await updateSearchCount(coinMetadata.id);
        
        console.log("Showing toast for:", coinMetadata.name);
        
        toast({
          title: "New Search!",
          description: (
            <span style={{ color: getRandomColor(), fontWeight: "bold" }}>
              {coinMetadata.name} was just searched! 🔍
            </span>
          ),
          duration: 5000,
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
        <GridOverlay />
        <div className="relative">
          <Toaster />
          <Sonner position="top-right" />
        </div>
        <BrowserRouter>
          <div className="min-h-screen flex w-full bg-black text-white">
            <main className="flex-1 overflow-x-hidden">
              <Header onSearch={handleSearch} isLoading={isLoading} />
              <div className="h-24"></div>
              <Routes>
                <Route path="/" element={<NewCoins />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/featured" element={<Featured />} />
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