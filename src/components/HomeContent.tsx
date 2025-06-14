
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LearnCard from '@/components/LearnCard';
import BrandCard from '@/components/BrandCard';
import DashboardSummary from "@/components/DashboardSummary";

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
    description: "Fashion that feels good and does good. Made from 100% organic and recycled materials.",
    imageUrl: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800`,
    offsetValue: 5.2,
    purchaseLink: "#",
  },
  {
    brandName: "GreenCommute Bikes",
    description: "Switch to a greener commute with our high-quality, durable electric and manual bikes.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 150,
    purchaseLink: "#",
  },
  {
    brandName: "TerraFoods Organics",
    description: "Sustainably sourced, organic groceries delivered to your door. Good for you, good for Earth.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 1.5,
    purchaseLink: "#",
  },
];

const HomeContent = ({ profile }: { profile: any }) => {
  const [tabValue, setTabValue] = useState("marketplace");

  return (
    <main className="flex-grow p-4 md:p-6 space-y-6 mb-16">
      <div className="max-w-4xl mx-auto mb-6">
        <DashboardSummary />
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs
          value={tabValue}
          onValueChange={setTabValue}
          defaultValue="marketplace"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace">Offset Marketplace</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="personalized">For You</TabsTrigger>
          </TabsList>
          <TabsContent value="marketplace">
            <div className="bg-white p-4 mt-2 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Offset Marketplace</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceBrands.map((brand) => (
                  <BrandCard key={brand.brandName} {...brand} />
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="learn">
            <div className="bg-white p-4 mt-2 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Learn About Offsetting</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {learnContent.map((item) => (
                  <LearnCard key={item.title} {...item} />
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="personalized">
            <div className="bg-white p-6 mt-2 rounded-lg shadow">
              <h3 className="font-semibold text-lg text-gray-800">Personalized Suggestions</h3>
              {profile?.lifestyle_tags && profile.lifestyle_tags.length > 0 ? (
                  <div>
                      <p className="text-gray-600 mt-2 mb-4">
                          Here are some suggestions based on your interests: {profile.lifestyle_tags.join(', ')}.
                      </p>
                      <p className="text-gray-500">More personalized content coming soon!</p>
                  </div>
              ) : (
                  <p className="text-gray-500 mt-2">
                      Complete your onboarding to get personalized suggestions!
                  </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default HomeContent;
