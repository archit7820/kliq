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
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">#{rank}</div>;
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
    <Card className="border-2 border-primary/20 rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Impact Leaderboard
          <Badge variant="secondary" className="ml-auto">Weekly</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockLeaderboardData.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${getRankBg(user.rank)} ${
              user.name === "You" ? "ring-2 ring-primary/30" : ""
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(user.rank)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                  {user.level}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{user.name}</p>
                  {user.name === "You" && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {user.streak} streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {user.badges} badges
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="font-bold text-primary text-lg">
                {user.totalImpact.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                +{user.weeklyImpact} this week
              </div>
            </div>
          </div>
        ))}

        {/* Progress to next level */}
        <div className="mt-6 p-4 bg-muted/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Next Level Progress</span>
            <span className="text-sm font-bold text-primary">234/500</span>
          </div>
          <Progress value={46.8} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            266 more impact points to reach Level 13
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactLeaderboard;