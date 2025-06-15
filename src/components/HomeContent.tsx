
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSummary from "@/components/DashboardSummary";
import UserChallengesList from "@/components/UserChallengesList";
import GamifiedUserSummary from "./GamifiedUserSummary";
import PersonalizedSuggestionsSection from "./PersonalizedSuggestionsSection";
import MarketplaceSection from "./MarketplaceSection";
import LearnSection from "./LearnSection";

// Define TABS array for the tab headers
const TABS = [
  {
    key: "personalized",
    label: (
      <span className="hidden sm:inline">For You</span>
    ),
    short: "You",
  },
  {
    key: "marketplace",
    label: (
      <span className="hidden sm:inline">Marketplace</span>
    ),
    short: "💸",
  },
  {
    key: "learn",
    label: (
      <span className="hidden sm:inline">Learn</span>
    ),
    short: "📖",
  },
];

const HomeContent = ({ profile }: { profile: any }) => {
  const [tabValue, setTabValue] = React.useState("personalized");
  // Gamified stats fallback logic
  const globalRank =
    typeof profile?.global_rank !== "undefined"
      ? profile.global_rank
      : profile?.kelp_points
        ? "#" + (1 + Math.floor(1000 / (profile.kelp_points + 1)))
        : "—";
  const bestBadge =
    (profile?.badges && profile.badges.length > 0 && profile.badges[0].name) ||
    "Kelp Sprout";
  const weeklyImpact = profile?.co2e_weekly_progress ?? 7.2;

  return (
    <main className="flex-grow px-1 sm:px-2 md:px-4 py-2 sm:py-4 space-y-4 mb-24 max-w-lg mx-auto">
      {/* Top Gamified User Summary */}
      <GamifiedUserSummary
        kelpPoints={profile?.kelp_points ?? 0}
        streakCount={profile?.streak_count ?? 0}
        weeklyImpact={weeklyImpact}
        globalRank={globalRank}
        bestBadge={bestBadge}
      />

      {/* Dashboard Summary */}
      <section className="rounded-2xl mb-1">
        <DashboardSummary />
      </section>

      {/* Interactive Tabs */}
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-violet-50 mt-4 mb-2 overflow-hidden shadow-sm h-10 sm:h-12">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="font-bold text-sm sm:text-base px-1 py-0 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              <span className="sm:hidden">{tab.short}</span>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personalized">
          <PersonalizedSuggestionsSection profile={profile} />
          <UserChallengesList highlightCurrent />
        </TabsContent>

        <TabsContent value="marketplace">
          <MarketplaceSection />
        </TabsContent>

        <TabsContent value="learn">
          <LearnSection />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default HomeContent;

