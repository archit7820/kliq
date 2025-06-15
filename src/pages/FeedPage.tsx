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

// Feed page with required props passed to FeedHeader
export default function FeedPage() {
  // Get profile and user loading state
  const {
    profile,
    isProfileLoading,
    user,
  } = useProfileWithStats();

  // We'll fetch impact (emissions) for current user for this month, grouped by category
  const [impact, setImpact] = useState({
    food: 0,
    travel: 0,
    shopping: 0,
  });

  useEffect(() => {
    if (!profile?.id) return;
    // Get first+last day of current month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    // Query: Total emission per category for current user, this month
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
        // Split per category
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
  // Paywall check
  if (!subscribed) {
    return <SubscriptionPaywall onSkip={skipOrCompleteSubscription} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <FeedHeader
        userProfile={profile}
        onRefresh={() => {}} // For API compatibility
        isRefetching={false}
      />
      {/* Top bar: thin wallet above snapshot, then filters */}
      <div className="w-full max-w-lg mx-auto mt-2 px-2 sm:px-4 flex flex-col gap-2">
        <KelpWalletBanner />
        <ImpactSnapshot impact={impact} />
      </div>
      <main className="flex-1 px-1 sm:px-2 md:px-4 py-4 max-w-lg mx-auto w-full">
        <FeedContent user={profile} />
      </main>
      <BottomNav />
    </div>
  );
}
