import React from "react";
import { Award, Leaf, Users, Target, Trophy, Star, Zap, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Achievement = {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  category: 'activity' | 'social' | 'impact' | 'streak';
  completed: boolean;
  reward?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
};

type DynamicAchievementsProps = {
  profile: any;
  activities: any[];
  badges: any[];
};

const DynamicAchievements: React.FC<DynamicAchievementsProps> = ({ 
  profile, 
  activities = [], 
  badges = [] 
}) => {
  const calculateAchievements = (): Achievement[] => {
    const activityCount = activities.length || 0;
    const currentStreak = profile?.streak_count || 0;
    const kelpPoints = profile?.kelp_points || 0;
    const weeklyProgress = profile?.co2e_weekly_progress || 0;
    
    return [
      // Activity-based achievements
      {
        id: 'first-activity',
        icon: Star,
        title: 'First Steps',
        description: 'Log your first eco-friendly activity',
        progress: Math.min(activityCount, 1),
        maxProgress: 1,
        category: 'activity',
        completed: activityCount >= 1,
        tier: 'bronze',
        reward: '+50 Kelp Points'
      },
      {
        id: 'activity-streak',
        icon: Zap,
        title: 'Consistent Green',
        description: 'Maintain a 7-day activity streak',
        progress: currentStreak,
        maxProgress: 7,
        category: 'streak',
        completed: currentStreak >= 7,
        tier: 'silver',
        reward: '+100 Kelp Points'
      },
      {
        id: 'eco-warrior',
        icon: Shield,
        title: 'Eco Warrior',
        description: 'Save 50kg of CO₂e this month',
        progress: weeklyProgress * 4, // Estimate monthly from weekly
        maxProgress: 50,
        category: 'impact',
        completed: (weeklyProgress * 4) >= 50,
        tier: 'gold',
        reward: '+200 Kelp Points'
      },
      {
        id: 'activity-milestone',
        icon: Target,
        title: 'Activity Champion',
        description: 'Log 25 eco-friendly activities',
        progress: activityCount,
        maxProgress: 25,
        category: 'activity',
        completed: activityCount >= 25,
        tier: 'gold',
        reward: '+150 Kelp Points'
      },
      {
        id: 'kelp-collector',
        icon: Trophy,
        title: 'Kelp Collector',
        description: 'Earn 1,000 Kelp Points',
        progress: kelpPoints,
        maxProgress: 1000,
        category: 'activity',
        completed: kelpPoints >= 1000,
        tier: 'platinum',
        reward: 'Special Badge'
      },
      {
        id: 'social-butterfly',
        icon: Users,
        title: 'Social Butterfly',
        description: 'Connect with 5 friends',
        progress: 0, // TODO: Connect to friends data
        maxProgress: 5,
        category: 'social',
        completed: false,
        tier: 'bronze',
        reward: '+75 Kelp Points'
      },
    ];
  };

  const achievements = calculateAchievements();
  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed && a.progress > 0);
  const upcomingAchievements = achievements.filter(a => !a.completed && a.progress === 0);

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 border-amber-200 bg-amber-50';
      case 'silver': return 'text-slate-600 border-slate-200 bg-slate-50';
      case 'gold': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'platinum': return 'text-purple-600 border-purple-200 bg-purple-50';
    }
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'activity': return 'text-green-600';
      case 'social': return 'text-blue-600';
      case 'impact': return 'text-emerald-600';
      case 'streak': return 'text-orange-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Achievement Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl border bg-card">
          <div className="text-lg font-bold text-primary">{completedAchievements.length}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center p-3 rounded-xl border bg-card">
          <div className="text-lg font-bold text-orange-600">{inProgressAchievements.length}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </div>
        <div className="text-center p-3 rounded-xl border bg-card">
          <div className="text-lg font-bold text-muted-foreground">{achievements.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">🎉 Completed</h4>
          <div className="space-y-2">
            {completedAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <achievement.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <Badge variant="outline" className={getTierColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.reward && (
                    <p className="text-xs text-primary font-medium mt-1">Reward: {achievement.reward}</p>
                  )}
                </div>
                <Trophy className="w-5 h-5 text-primary" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">🎯 In Progress</h4>
          <div className="space-y-3">
            {inProgressAchievements.map((achievement) => (
              <div key={achievement.id} className="p-3 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <achievement.icon className={`w-5 h-5 ${getCategoryColor(achievement.category)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <Badge variant="outline" className={getTierColor(achievement.tier)}>
                        {achievement.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}% complete</span>
                    {achievement.reward && <span>Reward: {achievement.reward}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Achievements */}
      {upcomingAchievements.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">📋 Upcoming</h4>
          <div className="space-y-2">
            {upcomingAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-muted">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <achievement.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-muted-foreground">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                <Badge variant="outline" className={getTierColor(achievement.tier)}>
                  {achievement.tier}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicAchievements;