
import React, { useEffect, useState } from "react";
import FeedHeader from "@/components/FeedHeader";
import FeedContent from "@/components/FeedContent";
import BottomNav from "@/components/BottomNav";
import KelpWalletBanner from "@/components/KelpWalletBanner";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import ImpactSnapshot from "@/components/ImpactSnapshot";
import { supabase } from "@/integrations/supabase/client";
import SubscriptionPaywall from "@/components/SubscriptionPaywall";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export default function FeedPage() {
  const {
    profile,
    isProfileLoading,
    user,
  } = useProfileWithStats();

  const [impact, setImpact] = useState({
    food: 0,
    travel: 0,
    shopping: 0,
  });

  useEffect(() => {
    if (!profile?.id) return;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    supabase
      .from("activities")
      .select("category, carbon_footprint_kg")
      .eq("user_id", profile.id)
      .gte("created_at", firstOfMonth)
      .lte("created_at", lastOfMonth)
      .then(({ data, error }) => {
        if (error) {
          setImpact({ food: 0, travel: 0, shopping: 0 });
          return;
        }
        const totals = { food: 0, travel: 0, shopping: 0 };
        (data || []).forEach((row) => {
          if (row.category?.toLowerCase() === "food") totals.food += Number(row.carbon_footprint_kg) || 0;
          if (row.category?.toLowerCase() === "travel" || row.category?.toLowerCase() === "transportation") totals.travel += Number(row.carbon_footprint_kg) || 0;
          if (row.category?.toLowerCase() === "shopping") totals.shopping += Number(row.carbon_footprint_kg) || 0;
        });
        setImpact(totals);
      });
  }, [profile?.id]);

  const { subscribed, skipOrCompleteSubscription } = useSubscriptionStatus();
  
  if (!subscribed) {
    return <SubscriptionPaywall onSkip={skipOrCompleteSubscription} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <FeedHeader
        userProfile={profile}
        onRefresh={() => {}}
        isRefetching={false}
      />
      
      {/* Mobile-first top content */}
      <div className="w-full px-2 mt-1 flex flex-col gap-2">
        <KelpWalletBanner profile={profile} />
        <ImpactSnapshot impact={impact} />
      </div>
      
      {/* Main feed content - mobile optimized */}
      <main className="flex-1 px-2 py-3 w-full">
        <div className="max-w-sm mx-auto">
          <FeedContent user={profile} />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
