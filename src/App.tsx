import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletContextProvider } from "./contexts/WalletContext";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import CreateMonster from "./pages/CreateMonster";
import ImportStats from "./pages/ImportStats";
import Templates from "./pages/Templates";
import MonsterDetail from "./pages/MonsterDetail";
import Leaderboard from "./pages/Leaderboard";
import CreatorRanking from "./pages/CreatorRanking";
import Discover from "./pages/Discover";
import PokeBattle from "./pages/PokeBattle";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateMonster />} />
              <Route path="/import" element={<ImportStats />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/ranking" element={<CreatorRanking />} />
              <Route path="/battle" element={<PokeBattle />} />
              <Route path="/poke/:id" element={<MonsterDetail />} />
              <Route path="/monster/:id" element={<MonsterDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletContextProvider>
  </QueryClientProvider>
);

export default App;
