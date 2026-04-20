import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueueProvider } from "@/context/QueueContext";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueueProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster
            richColors
            closeButton
            position="top-center"
            expand={false}
            toastOptions={{
              style: {
                background: "#111118",
                border: "1px solid rgba(0,229,200,0.15)",
                color: "#F0F0FA",
              },
            }}
          />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </QueryClientProvider>
    </QueueProvider>
  </AuthProvider>
);

export default App;
