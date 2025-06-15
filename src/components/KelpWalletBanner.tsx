import React, { useState } from "react";
import { Wallet } from "lucide-react";
import KelpWalletModal from "./KelpWalletModal";

const KelpWalletBanner = ({ profile }: { profile: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between p-2 px-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-sm hover:shadow-md transition group focus:outline-none"
        aria-label="View Kelp Wallet details"
        tabIndex={0}
      >
        <div className="flex items-center gap-2">
          <div className="bg-green-600/90 text-white rounded-full flex items-center justify-center w-8 h-8 shadow group-hover:scale-110 transition">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-semibold text-green-900 text-base">
            {(profile?.kelp_points ?? 0)} Kelp Points
          </span>
        </div>
        <span className="text-xs text-green-700 underline ml-2 hidden sm:block group-hover:text-green-900">
          Details
        </span>
      </button>
      {open && <KelpWalletModal open={open} setOpen={setOpen} points={profile?.kelp_points ?? 0} />}
    </>
  );
};

export default KelpWalletBanner;
