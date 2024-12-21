import { Toaster } from "@/components/ui/toaster"; // Ensure only the correct toaster is used
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";
import { WalletProvider } from "@/components/WalletProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

// Lazy load route components
const Index = lazy(() => import("./pages/Index"));
const CoinProfile = lazy(() => import("./pages/CoinProfile"));
const CoinSearch = lazy(() => import("./pages/CoinSearch"));
const LaunchCoin = lazy(() => import("./pages/LaunchCoin"));
const RocketLaunch = lazy(() => import("./pages/RocketLaunch"));

console.log("[App] Initializing...");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("[App] Rendering...");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WalletProvider>
            <Toaster />
            <BrowserRouter>
              <ErrorBoundary>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-black text-white">
                    <ErrorBoundary>
                      <AppSidebar />
                    </ErrorBoundary>
                    <main className="flex-1">
                      {/* Fixed Header */}
                      <div className="fixed top-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-sm z-20 flex items-center px-4">
                        <img
                          src={process.env.REACT_APP_LOGO_URL || "/default-logo.png"}
                          alt="App Logo"
                          className="h-28 ml-16"
                        />
                      </div>
                      <div className="h-20"></div>

                      {/* WalletConnect Component */}
                      <ErrorBoundary>
                        <div className="z-30 relative">
                          <WalletConnect />
                        </div>
                      </ErrorBoundary>

                      {/* Routes */}
                      <ErrorBoundary>
                        <Suspense fallback={<div>Loading...</div>}>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/coin/:id" element={<CoinProfile />} />
                            <Route path="/search" element={<CoinSearch />} />
                            <Route path="/launch" element={<LaunchCoin />} />
                            <Route path="/rocket-launch" element={<RocketLaunch />} />
                            <Route
                              path="/leaderboard"
                              element={<div className="p-6">Leaderboard Coming Soon</div>}
                            />
                            <Route
                              path="/holdings"
                              element={<div className="p-6">Holdings Coming Soon</div>}
                            />
                          </Routes>
                        </Suspense>
                      </ErrorBoundary>
                    </main>
                  </div>
                </SidebarProvider>
              </ErrorBoundary>
            </BrowserRouter>
          </WalletProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
