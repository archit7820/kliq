
import React from "react";
import { Globe } from "lucide-react";

// Example top user avatars (these are placeholders, use dynamic data as available)
const topUsers = [
  { avatar: "https://randomuser.me/api/portraits/men/1.jpg", alt: "Top user 1" },
  { avatar: "https://randomuser.me/api/portraits/women/2.jpg", alt: "Top user 2" },
  { avatar: "https://randomuser.me/api/portraits/men/3.jpg", alt: "Top user 3" }
];

const CurrentChallengeCard = () => (
  <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-[#F8F5FF] border border-[#ece6fa] mt-1 shadow-sm animate-fade-in transition-all">
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-2 font-bold text-violet-800 text-base">
        <Globe className="h-5 w-5 text-violet-500" /> Current Challenge
      </span>
      <span className="text-[14px] text-violet-700 font-medium leading-snug mt-0.5 block">
        &quot;Bike or walk instead of drive 3 times this week!&quot;
      </span>
    </div>
    {/* Compact leaderboard as avatars + label */}
    <div className="flex flex-col items-end gap-1 min-w-[70px]">
      <span className="font-normal text-[13px] text-gray-500 mb-1 pr-1">
        Top Users
      </span>
      <div className="flex -space-x-2">
        {topUsers.map((user, i) => (
          <img
            key={i}
            src={user.avatar}
            alt={user.alt}
            className={`rounded-full w-7 h-7 border-2 border-violet-200 bg-white shadow hover:scale-105 transition-transform duration-150`}
          />
        ))}
      </div>
    </div>
  </div>
);

export default CurrentChallengeCard;
