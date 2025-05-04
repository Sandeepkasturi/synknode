
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AirShare from "./pages/AirShare";
import Sharomatic from "./pages/Sharomatic";
import { PeerProvider } from "./context/PeerContext";
import { AirShareProvider } from "./context/AirShareContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Using only the Sonner toaster for all notifications */}
      <Toaster richColors closeButton position="top-right" />
      <PeerProvider>
        <AirShareProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/airshare" element={<AirShare />} />
              <Route path="/sharomatic" element={<Sharomatic />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AirShareProvider>
      </PeerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
