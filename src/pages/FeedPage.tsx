
import React, { useState, useCallback } from "react";
import FeedHeader from "@/components/FeedHeader";
import FeedContent from "@/components/FeedContent";
import BottomNav from "@/components/BottomNav";
import KelpWallet from "@/components/KelpWallet";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";

// Feed page with required props passed to FeedHeader
export default function FeedPage() {
  // Get profile and user loading state
  const {
    profile,
    isProfileLoading,
    user,
    // include refetch if needed for onRefresh
  } = useProfileWithStats();

  // Refetch state for refreshing header, you might want to wire this to a real API-refetch
  const [isRefetching, setIsRefetching] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefetching(true);
    // Implement actual refetch logic here if needed (react-query or supabase query)
    setTimeout(() => {
      setIsRefetching(false);
    }, 1000);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <FeedHeader
        userProfile={profile}
        onRefresh={handleRefresh}
        isRefetching={isRefetching}
      />
      <main className="flex-1 px-1 sm:px-2 md:px-4 py-4 max-w-lg mx-auto w-full">
        {/* Kelp Wallet with real-time points */}
        <KelpWallet />
        <FeedContent user={profile} />
      </main>
      <BottomNav />
    </div>
  );
}
