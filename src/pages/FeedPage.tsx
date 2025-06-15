
import React from "react";
import FeedHeader from "@/components/FeedHeader";
import FeedContent from "@/components/FeedContent";
import BottomNav from "@/components/BottomNav";
import KelpWalletBanner from "@/components/KelpWalletBanner";
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

  // Remove refetch state for now, as we aren't wiring refresh yet
  // Place KelpWalletBanner above FeedContent, and restore FeedContent filter prominence

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <FeedHeader
        userProfile={profile}
        onRefresh={() => {}} // Just keep for API compatibility
        isRefetching={false}
      />
      {/* Top bar: wallet banner above feed filters */}
      <div className="w-full max-w-lg mx-auto mt-2 px-2 sm:px-4 flex flex-col gap-2">
        <KelpWalletBanner />
      </div>
      <main className="flex-1 px-1 sm:px-2 md:px-4 py-4 max-w-lg mx-auto w-full">
        <FeedContent user={profile} />
      </main>
      <BottomNav />
    </div>
  );
}
