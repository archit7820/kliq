
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import FriendsPage from "./pages/FriendsPage";
import LogActivityPage from "./pages/LogActivityPage";
import FeedPage from "./pages/FeedPage";
import OnboardingPage from "./pages/OnboardingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityPage from "./pages/CommunityPage";
import ImpactDashboardPage from "./pages/ImpactDashboardPage";
import ChallengesPage from "./pages/ChallengesPage";
import CreateChallengePage from "./pages/CreateChallengePage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import ExplorePage from "./pages/ExplorePage";
import MainLayout from "@/components/MainLayout";

const queryClient = new QueryClient();

const MainAppRoutes = () => (
  <MainLayout>
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/log-activity" element={<LogActivityPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/impact-dashboard" element={<ImpactDashboardPage />} />
      <Route path="/challenges" element={<ChallengesPage />} />
      <Route path="/create-challenge" element={<CreateChallengePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/chat/:userId" element={<ChatPage />} />
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/communities/create" element={<CreateCommunityPage />} />
      <Route path="/communities/:communityId" element={<CommunityPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </MainLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* Everything else goes through MainAppRoutes to get consistent BottomNav */}
          <Route path="/*" element={<MainAppRoutes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
