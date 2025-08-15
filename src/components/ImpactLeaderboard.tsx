
import React from "react";
import { Trophy, Crown, Star, TrendingUp, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockLeaderboardData = [
  {
    id: 1,
    name: "EcoWarrior2024",
    avatar: "/placeholder.svg",
    totalImpact: 2847,
    weeklyImpact: 486,
    streak: 23,
    badges: 12,
    level: 18,
    rank: 1
  },
  {
    id: 2,
    name: "GreenMachine",
    avatar: "/placeholder.svg",
    totalImpact: 2634,
    weeklyImpact: 423,
    streak: 15,
    badges: 9,
    level: 16,
    rank: 2
  },
  {
    id: 3,
    name: "ImpactMaker",
    avatar: "/placeholder.svg",
    totalImpact: 2401,
    weeklyImpact: 398,
    streak: 18,
    badges: 11,
    level: 15,
    rank: 3
  },
  {
    id: 4,
    name: "PlanetSaver",
    avatar: "/placeholder.svg",
    totalImpact: 2234,
    weeklyImpact: 367,
    streak: 12,
    badges: 8,
    level: 14,
    rank: 4
  },
  {
    id: 5,
    name: "You",
    avatar: "/placeholder.svg",
    totalImpact: 1876,
    weeklyImpact: 234,
    streak: 8,
    badges: 6,
    level: 12,
    rank: 7
  }
];

const ImpactLeaderboard = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-gray-50 border-gray-200";
      case 3:
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <Card className="border border-primary/20 rounded-2xl">
      <CardHeader className="pb-3 p-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          Impact Leaderboard
          <Badge variant="secondary" className="ml-auto text-xs">Weekly</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        {mockLeaderboardData.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${getRankBg(user.rank)} ${
              user.name === "You" ? "ring-1 ring-primary/30" : ""
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(user.rank)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative">
                <Avatar className="w-8 h-8 border border-primary/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-background">
                  {user.level}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-xs truncate">{user.name}</p>
                  {user.name === "You" && (
                    <Badge variant="outline" className="text-xs px-1 py-0">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    {user.streak}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" />
                    {user.badges}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-primary text-sm">
                {user.totalImpact.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                +{user.weeklyImpact}
              </div>
            </div>
          </div>
        ))}

        {/* Progress to next level */}
        <div className="mt-4 p-3 bg-muted/20 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Next Level</span>
            <span className="text-xs font-bold text-primary">234/500</span>
          </div>
          <Progress value={46.8} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            266 more points to Level 13
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactLeaderboard;
