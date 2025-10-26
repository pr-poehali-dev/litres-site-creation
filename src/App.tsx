
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { CartProvider } from "@/contexts/CartContext";
import { BookProvider } from "@/contexts/BookContext";
import { MusicProvider } from "@/contexts/MusicContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Music from "./pages/Music";
import NewReleases from "./pages/NewReleases";
import Catalog from "./pages/Catalog";
import MyBooks from "./pages/MyBooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BookProvider>
        <MusicProvider>
          <PurchaseProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/new-releases" element={<NewReleases />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/my-books" element={<MyBooks />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </PurchaseProvider>
        </MusicProvider>
      </BookProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;