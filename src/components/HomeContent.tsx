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
  // All calculations below now always use the *props* profile.
  const globalRank =
    typeof profile?.global_rank !== "undefined"
      ? profile.global_rank
      : profile?.kelp_points
        ? "#" + (1 + Math.floor(1000 / (profile.kelp_points + 1)))
        : "—";
  const bestBadge =
    (profile?.badges && profile.badges.length > 0 && profile.badges[0].name) ||
    "Kelp Sprout";
  const weeklyImpact = profile?.co2e_weekly_progress ?? 0;

  return (
    <main className="flex-grow px-4 py-6 bg-gradient-to-br from-mint-50 to-sky-50 min-h-screen">
      <div className="max-w-lg mx-auto space-y-6 pb-24">
        
        {/* Stories & Highlights Carousel */}
        <section className="bg-card rounded-2xl p-4 shadow-sm border" aria-label="Stories and highlights">
          <h2 className="sr-only">Stories & Highlights</h2>
          <HomeStoriesBar profile={profile} />
        </section>

        {/* Overall Status & Rankings */}
        <section className="bg-card rounded-2xl shadow-sm border" aria-label="Your status and rankings">
          <h2 className="sr-only">Your Status & Rankings</h2>
          <GamifiedUserSummary
            kelpPoints={profile?.kelp_points ?? 0}
            streakCount={profile?.streak_count ?? 0}
            weeklyImpact={weeklyImpact}
            globalRank={globalRank}
            bestBadge={bestBadge}
          />
        </section>

        {/* For You Suggestions */}
        <PersonalizedSuggestionsSection profile={profile} />

        {/* My Challenges */}
        <section className="bg-card rounded-2xl p-4 shadow-sm border" aria-label="Your current challenges">
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
        <section className="bg-card rounded-2xl shadow-sm border" aria-label="Marketplace">
          <h2 className="sr-only">Marketplace</h2>
          <MarketplaceSection />
        </section>

      </div>
    </main>
  );
};

export default HomeContent;
