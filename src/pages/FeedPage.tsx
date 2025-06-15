
import React from "react";
import FeedHeader from "@/components/FeedHeader";
import FeedContent from "@/components/FeedContent";
import BottomNav from "@/components/BottomNav";
import KelpWallet from "@/components/KelpWallet";

export default function FeedPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <FeedHeader />
      <main className="flex-1 px-1 sm:px-2 md:px-4 py-4 max-w-lg mx-auto w-full">
        {/* Kelp Wallet with real-time points */}
        <KelpWallet />
        <FeedContent />
      </main>
      <BottomNav />
    </div>
  );
}
