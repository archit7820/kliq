import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GamifiedUserSummary from "./GamifiedUserSummary";
import PersonalizedSuggestionsSection from "./PersonalizedSuggestionsSection";
import MarketplaceSection from "./MarketplaceSection";
import HomeStoriesBar from "./HomeStoriesBar";
import CurrentChallenges from "./CurrentChallenges";
import CommunityActivity from "./CommunityActivity";
import GamifiedEngagementCards from "./GamifiedEngagementCards";

const HomeContent = ({ profile }: { profile: any }) => {
  // Enhanced impact calculations
  const weeklyImpact = {
    co2Saved: profile?.co2e_weekly_progress ?? 2.3,
    waterSaved: (profile?.kelp_points ?? 30) * 0.8, // Estimate based on activities
    wasteReduced: (profile?.kelp_points ?? 30) * 0.05,
    energySaved: (profile?.kelp_points ?? 30) * 0.3
  };
  
  const globalRank =
    typeof profile?.global_rank !== "undefined"
      ? profile.global_rank
      : profile?.kelp_points
        ? "#" + (1 + Math.floor(1000 / (profile.kelp_points + 1)))
        : "—";
  const bestBadge =
    (profile?.badges && profile.badges.length > 0 && profile.badges[0].name) ||
    "Kelp Sprout";
  

  return (
    <main className="flex-grow px-3 py-4 bg-gradient-to-br from-mint-50/50 to-sky-50/50 min-h-screen">
      <div className="max-w-md mx-auto space-y-4 pb-20">{/* Reduced bottom padding for mobile nav */}
        
        {/* Stories & Highlights Carousel */}
        <section className="bg-card rounded-xl p-3 shadow-sm border" aria-label="Activities">
          <h2 className="sr-only">Activities & Stories</h2>
          <HomeStoriesBar profile={profile} />
        </section>

        {/* Overall Status & Rankings */}
        <section className="bg-card rounded-xl shadow-sm border" aria-label="Your impact summary">
          <h2 className="sr-only">Your Impact & Rankings</h2>
          <GamifiedUserSummary
            kelpPoints={profile?.kelp_points ?? 30}
            streakCount={profile?.streak_count ?? 3}
            weeklyImpact={weeklyImpact}
            globalRank={globalRank}
            bestBadge={bestBadge}
          />
        </section>

        {/* For You Suggestions */}
        <PersonalizedSuggestionsSection profile={profile} />

        {/* My Challenges */}
        <section className="bg-card rounded-xl p-4 shadow-sm border" aria-label="Your current challenges">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            My Current Challenges
          </h2>
          <CurrentChallenges />
        </section>

        {/* Community Activity */}
        <CommunityActivity />

        {/* Gamified Engagement Cards */}
        <GamifiedEngagementCards profile={profile} />

        {/* Marketplace Section */}
        <section className="bg-card rounded-xl shadow-sm border" aria-label="Marketplace">
          <h2 className="sr-only">Marketplace</h2>
          <MarketplaceSection />
        </section>

      </div>
    </main>
  );
};

export default HomeContent;
