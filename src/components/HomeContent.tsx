import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSummary from "@/components/DashboardSummary";
import UserChallengesList from "@/components/UserChallengesList";
import GamifiedUserSummary from "./GamifiedUserSummary";
import PersonalizedSuggestionsSection from "./PersonalizedSuggestionsSection";
import MarketplaceSection from "./MarketplaceSection";
import LearnSection from "./LearnSection";
import HomeStoriesBar from "./HomeStoriesBar";

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
    <main className="flex-grow px-1 sm:px-2 md:px-0 py-0 bg-background min-h-screen max-w-full w-full">
      <section className="mx-auto max-w-md w-full flex flex-col gap-3 mt-2 pb-24">
        <HomeStoriesBar profile={profile} />
        {/* Gamified summary — light card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-0 mt-1">
          <GamifiedUserSummary
            kelpPoints={profile?.kelp_points ?? 0}
            streakCount={profile?.streak_count ?? 0}
            weeklyImpact={weeklyImpact}
            globalRank={globalRank}
            bestBadge={bestBadge}
          />
        </div>
        {/* Dashboard—card style */}
        <section className="rounded-2xl border border-border bg-card shadow-sm px-0 py-0">
          <DashboardSummary /* optionally pass profile if DashboardSummary needs it */ />
        </section>
        {/* Animated Tabs, raised from bg */}
        <Tabs
          value={tabValue}
          onValueChange={setTabValue}
          className="w-full mt-2 drop-shadow-sm"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/60 backdrop-blur overflow-hidden shadow-sm h-10 sm:h-12 mb-3">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="font-medium text-sm sm:text-base px-1 py-0 data-[state=active]:bg-background data-[state=active]:text-foreground transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/40 hover-scale"
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
      </section>
    </main>
  );
};

export default HomeContent;
