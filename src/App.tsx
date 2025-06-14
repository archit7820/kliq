
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import InviteFlow from "./pages/InviteFlow";
import FriendsPage from "./pages/FriendsPage";
import LogActivityPage from "./pages/LogActivityPage";
import FeedPage from "./pages/FeedPage"; // New
import OnboardingPage from "./pages/OnboardingPage"; // New

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} /> {/* New */}
          <Route path="/invite" element={<InviteFlow />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/log-activity" element={<LogActivityPage />} />
          <Route path="/feed" element={<FeedPage />} /> {/* Updated */}
          <Route path="/leaderboard" element={<HomePage />} /> {/* Placeholder */}
          <Route path="/profile" element={<HomePage />} /> {/* Placeholder */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
