
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip"; // temporarily remove
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
import FeedPage from "./pages/FeedPage";
import OnboardingPage from "./pages/OnboardingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityPage from "./pages/CommunityPage";
import WelcomePage from "./pages/WelcomePage";
import ImpactDashboardPage from "./pages/ImpactDashboardPage";
import ChallengesPage from "./pages/ChallengesPage";
import CreateChallengePage from "./pages/CreateChallengePage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import MainLayout from "@/components/MainLayout";

const queryClient = new QueryClient();

const MainAppRoutes = () => (
  <MainLayout>
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/log-activity" element={<LogActivityPage />} />
      <Route path="/feed" element={<FeedPage />} />
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
    {/* Removed TooltipProvider to address double-React/context bug */}
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/invite" element={<InviteFlow />} />
        {/* Everything else goes through MainAppRoutes to get consistent BottomNav */}
        <Route path="/*" element={<MainAppRoutes />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

