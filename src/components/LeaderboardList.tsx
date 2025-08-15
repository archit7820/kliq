
import React from "react";
import TopPodium from "./TopPodium";
import LeaderboardRowGamified from "./LeaderboardRowGamified";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trophy } from "lucide-react";

type LeaderboardListProps = {
  leaderboard: any[];
  userId?: string;
  selectedCategory?: string;
  onProfileClick?: (userId: string) => void;
};

const LeaderboardList: React.FC<LeaderboardListProps> = ({ leaderboard, userId, selectedCategory, onProfileClick }) => {
  const isMobile = useIsMobile();
  const podium = leaderboard.slice(0, 3);
  let rest = leaderboard.slice(3);

  // Add mock data if there aren't enough real players to demonstrate the carousel
  if (rest.length < 4) {
    const mockPlayers = [
      { id: 'mock1', username: 'EcoWarrior', avatar_url: null, kelp_points: 850 },
      { id: 'mock2', username: 'GreenThumb', avatar_url: null, kelp_points: 720 },
      { id: 'mock3', username: 'TreeHugger', avatar_url: null, kelp_points: 680 },
      { id: 'mock4', username: 'EarthLover', avatar_url: null, kelp_points: 650 },
      { id: 'mock5', username: 'ClimateHero', avatar_url: null, kelp_points: 620 },
    ];
    rest = [...rest, ...mockPlayers.slice(0, 5 - rest.length)];
  }

  return (
    <div className="space-y-4" role="region" aria-label="Leaderboard rankings">
      {/* Mobile-Optimized Top 3 Podium */}
      <div className="mb-6">
        <TopPodium podium={podium} userId={userId} />
      </div>

      {/* Mobile-Optimized Rest of leaderboard */}
      {rest.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Trophy className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm">No more players in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-3 text-center">
            Other Rankings
          </h3>
          <div className="space-y-2">
            {rest.map((profile, i) => (
              <LeaderboardRowGamified
                key={profile.id}
                profile={profile}
                rank={i + 4}
                userId={userId}
                categoryTag={selectedCategory}
                onClick={onProfileClick ? () => onProfileClick(profile.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardList;
