
import React from "react";
import TopPodium from "./TopPodium";
import LeaderboardRowGamified from "./LeaderboardRowGamified";

type LeaderboardListProps = {
  leaderboard: any[];
  userId?: string;
};

const LeaderboardList: React.FC<LeaderboardListProps> = ({ leaderboard, userId }) => {
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="py-2 w-full">
      <TopPodium podium={podium} userId={userId} />
      <div className="w-full text-center mb-2 font-semibold text-gray-500 text-sm tracking-widest">
        <span className="inline-block bg-green-200 rounded-full px-3 py-0.5 shadow animate-in animate-fade-in">Leaderboard</span>
      </div>
      <div>
        {rest.length === 0 && (
          <div className="py-6 text-center text-gray-400">No more players... join in!</div>
        )}
        {rest.map((profile, i) => (
          <LeaderboardRowGamified
            key={profile.id}
            profile={profile}
            rank={i + 3}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
};

export default LeaderboardList;
