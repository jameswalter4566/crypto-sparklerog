import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { MovingBanners } from "@/components/effects/MovingBanners";
import Index from "@/pages/Index";
import CoinProfile from "@/pages/CoinProfile";
import CoinSearch from "@/pages/CoinSearch";
import LiveStream from "@/pages/LiveStream";
import StreamViewer from "@/pages/StreamViewer";
import Featured from "@/pages/Featured";
import Explore from "@/pages/Explore";
import LaunchCoin from "@/pages/LaunchCoin";

const App = () => {
  return (
    <Router>
      <AnimatedBackground />
      <MovingBanners />
      <Header onSearch={() => {}} isLoading={false} />
      <main className="pt-24">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/coin/:mintAddress" element={<CoinProfile />} />
          <Route path="/search" element={<CoinSearch />} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/launch" element={<LaunchCoin />} />
          <Route path="/live-stream" element={<LiveStream />} />
          <Route path="/stream/:streamId" element={<StreamViewer />} />
        </Routes>
      </main>
      <Toaster />
    </Router>
  );
};

export default App;