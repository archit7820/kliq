import React from "react";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

type RowProps = {
  profile: any;
  rank: number;
  userId?: string;
  categoryTag?: string;
  onClick?: () => void;
};

const LeaderboardRowGamified: React.FC<RowProps> = ({ 
  profile, 
  rank, 
  userId, 
  categoryTag = "All", 
  onClick 
}) => {
  const isCurrentUser = userId === profile.id;
  const showTrophy = rank === 1 || rank === 2;

  const baseClasses = `
    p-4 rounded-lg border transition-all duration-200 cursor-pointer
    ${isCurrentUser 
      ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20" 
      : "bg-card hover:bg-muted/50 border-border hover:border-border/80"
    }
    ${onClick ? "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50" : ""}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `View profile of ${profile.username || "user"}` : undefined}
    >
      <div className="flex items-center gap-3 w-full">
        {/* Rank */}
        <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-foreground">
          {showTrophy ? (rank === 1 ? "🥇" : "🥈") : rank}
        </div>

        {/* Avatar */}
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile.avatar_url} alt={`${profile.username}'s avatar`} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {profile.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
              {profile.username || "Anonymous"}
            </p>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">You</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-muted-foreground">
              {profile.kelp_points || 0} pts
            </span>
            {categoryTag !== "All" && (
              <Badge variant="outline" className="text-xs">
                {categoryTag}
              </Badge>
            )}
          </div>
        </div>

        {/* Trophy for top ranks */}
        {showTrophy && (
          <div className="flex items-center justify-center w-8 h-8">
            <Trophy className={`w-5 h-5 ${rank === 1 ? "text-yellow-500" : "text-gray-400"}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardRowGamified;