import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage"; // Added
import HomePage from "./pages/HomePage"; // Added
import SignupPage from "./pages/SignupPage"; // Added
import InviteFlow from "./pages/InviteFlow"; // Added

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} /> {/* Added */}
          <Route path="/home" element={<HomePage />} /> {/* Added */}
          <Route path="/invite" element={<InviteFlow />} /> {/* New invite flow */}
          <Route path="/signup" element={<SignupPage />} /> {/* Signup page */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* Placeholder routes for bottom nav items - to be implemented later */}
          <Route path="/log-activity" element={<HomePage />} /> {/* Temporary, replace with actual page */}
          <Route path="/feed" element={<HomePage />} /> {/* Temporary, replace with actual page */}
          <Route path="/leaderboard" element={<HomePage />} /> {/* Temporary, replace with actual page */}
          <Route path="/profile" element={<HomePage />} /> {/* Temporary, replace with actual page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
