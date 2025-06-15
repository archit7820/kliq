import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LearnCard from '@/components/LearnCard';
import BrandCard from '@/components/BrandCard';
import DashboardSummary from "@/components/DashboardSummary";
import UserChallengesList from "@/components/UserChallengesList";
import GamifiedUserSummary from "./GamifiedUserSummary";

const learnContent = [
  {
    title: "What is a Carbon Footprint?",
    description: "Understand the total amount of greenhouse gases produced to support human activities.",
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    link: "https://www.nature.org/en-us/get-involved/how-to-help/carbon-footprint-calculator/",
  },
  {
    title: "Renewable Energy at Home",
    description: "Discover how solar panels and other renewables can reduce your home's carbon emissions.",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    link: "https://www.energy.gov/eere/solar/homeowners-guide-going-solar",
  },
  {
    title: "Sustainable Travel Tips",
    description: "Learn to explore the world while minimizing your environmental impact.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    link: "https://www.unwto.org/sustainable-development/sustainable-tourism-tips-for-travellers",
  },
];

const marketplaceBrands = [
  {
    brandName: "EcoThreads Apparel",
    description: "Fashion that feels good and does good.",
    imageUrl: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800`,
    offsetValue: 5.2,
    // affiliate example
    purchaseLink: "https://bit.ly/sustainable-tshirts-aff",
  },
  {
    brandName: "GreenCommute Bikes",
    description: "Switch to a greener commute with our electric bikes.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 150,
    purchaseLink: "https://amzn.to/3ZT5q9C",
  },
  {
    brandName: "SolarX Panels",
    description: "Renewable home energy, easy install, lasting impact.",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 210,
    purchaseLink: "https://shareasale.com/r.cfm?b=solar-panels",
  },
  {
    brandName: "TerraFoods Organics",
    description: "Organic groceries, planet-friendly delivery.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 1.5,
    purchaseLink: "https://amzn.to/3RuEcoT",
  },
];

const HomeContent = ({ profile }: { profile: any }) => {
  const [tabValue, setTabValue] = React.useState("personalized");
  // Add global rank using a simple fallback if not present
  const globalRank =
    typeof profile?.global_rank !== "undefined"
      ? profile.global_rank
      : profile?.kelp_points
        ? "#" + (1 + Math.floor(1000 / (profile.kelp_points + 1)))
        : "—";

  // "Best badge" could ideally come from real badge data, for now use a sample
  const bestBadge =
    (profile?.badges && profile.badges.length > 0 && profile.badges[0].name) ||
    "Kelp Sprout";

  // Demo weekly impact
  const weeklyImpact = profile?.co2e_weekly_progress ?? 7.2;

  return (
    <main className="flex-grow px-1 sm:px-2 md:px-4 py-2 sm:py-4 space-y-4 mb-24 max-w-lg mx-auto">
      {/* Gamified User Summary */}
      <GamifiedUserSummary
        kelpPoints={profile?.kelp_points ?? 0}
        streakCount={profile?.streak_count ?? 0}
        weeklyImpact={weeklyImpact}
        globalRank={globalRank}
        bestBadge={bestBadge}
      />
      {/* Dashboard summary card (top) */}
      <section className="rounded-2xl mb-1">
        <DashboardSummary />
      </section>
      {/* Short & Responsive Tabs */}
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

        {/* For You */}
        <TabsContent value="personalized">
          <section className="bg-white p-4 rounded-2xl shadow animate-fade-in mb-4">
            <h3 className="font-semibold text-lg mb-2 text-violet-900">Personalized Suggestions</h3>
            {profile?.lifestyle_tags && profile.lifestyle_tags.length > 0 ? (
                <div>
                    <p className="text-gray-700 mb-2 sm:mb-3">
                        Here are some suggestions based on your interests:
                        <span className="block my-1 font-semibold text-violet-700">
                            {profile.lifestyle_tags.map((tag: string, i: number) => (
                              <span key={tag}>
                                <span className="hover:underline cursor-pointer transition-all animate-fade-in">{tag}</span>
                                {i !== profile.lifestyle_tags.length - 1 && ", "}
                              </span>
                            ))}
                        </span>
                    </p>
                    <p className="text-gray-400 text-xs">More personalized content coming soon!</p>
                </div>
            ) : (
                <p className="text-gray-400 text-xs sm:text-sm">
                    Complete your onboarding to get personalized suggestions!
                </p>
            )}
          </section>
          {/* Accepted and current challenges */}
          <UserChallengesList highlightCurrent />
        </TabsContent>

        {/* Marketplace */}
        <TabsContent value="marketplace">
          <section className="bg-white p-4 rounded-2xl shadow animate-fade-in">
            <h3 className="font-semibold text-lg mb-3 text-green-800">Offset Marketplace</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {marketplaceBrands.map((brand) => (
                <div
                  key={brand.brandName}
                  className="hover:scale-102 transition-transform duration-200 animate-fade-in"
                >
                  <BrandCard {...brand} />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-4">
              Some links may be affiliate and support green efforts 🌱
            </div>
          </section>
        </TabsContent>

        {/* Learn */}
        <TabsContent value="learn">
          <section className="bg-white p-4 rounded-2xl shadow animate-fade-in">
            <h3 className="font-semibold text-lg mb-3 text-blue-900">Learn</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {learnContent.map((item) => (
                <div key={item.title} className="hover:scale-102 transition-transform duration-200 animate-fade-in">
                  <LearnCard {...item} />
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default HomeContent;
