
import React from "react";
import ChallengeCreate from "@/components/ChallengeCreate";
import { Link } from "react-router-dom";

const CreateChallengePage = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-8">
    <div className="w-full max-w-screen-sm">
      <Link
        to="/leaderboard"
        className="inline-flex items-center text-blue-600 mb-4 hover:underline"
      >
        &larr; Back to Leaderboard
      </Link>
      <ChallengeCreate />
    </div>
  </div>
);

export default CreateChallengePage;
