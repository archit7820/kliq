
import React from "react";
import { Wallet } from "lucide-react";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";

// Simple wallet component for use on feeds page
const KelpWallet = () => {
  const { profile, isProfileLoading } = useProfileWithStats();

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-3 border shadow-sm w-full mb-4">
      <div className="bg-green-600/90 text-white rounded-full p-2 flex items-center justify-center shadow">
        <Wallet className="w-7 h-7" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-green-900 text-lg">
          {isProfileLoading ? "..." : (profile?.kelp_points ?? 0)} Kelp Points
        </span>
        <span className="text-xs text-gray-700">
          Use your Kelp points for green discounts!
        </span>
      </div>
    </div>
  );
};

export default KelpWallet;
