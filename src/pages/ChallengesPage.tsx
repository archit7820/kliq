
import React from "react";
import CurrentChallenges from "@/components/CurrentChallenges";
import { Link } from "react-router-dom";

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-3">
      <div className="max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center mb-7 gap-2">
          <Link to="/leaderboard" className="self-start text-blue-700 hover:underline text-base">
            &larr; Back to Stats
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Current Challenges
          </h1>
        </div>
        <CurrentChallenges />
      </div>
    </div>
  );
}
