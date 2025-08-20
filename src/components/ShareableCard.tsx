
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Share, Leaf, Zap, TrendingUp, Calendar, Award, Target, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface ShareableCardProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface WeeklyStats {
  totalActivities: number;
  totalCarbonSaved: number;
  topCategory: string;
  kelpPointsEarned: number;
  streakDays: number;
  weeklyGoal: number;
  goalProgress: number;
}

const ShareableCard = ({ isOpen, onClose, userId }: ShareableCardProps) => {
  const { profile } = useProfileWithStats();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchWeeklyStats();
    }
  }, [isOpen, userId]);

  const fetchWeeklyStats = async () => {
    if (!userId) return;
    
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", oneWeekAgo.toISOString());

      if (error) throw error;

      if (activities) {
        const totalCarbonSaved = activities.reduce((sum, activity) => {
          const carbon = Number(activity.carbon_footprint_kg);
          return sum + (carbon < 0 ? Math.abs(carbon) : 0);
        }, 0);

        const categoryCount: Record<string, number> = {};
        activities.forEach(activity => {
          if (activity.category) {
            categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
          }
        });

        const topCategory = Object.entries(categoryCount).length > 0 
          ? Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0][0]
          : "eco_activity";

        const weeklyGoal = profile?.co2e_weekly_goal || 7.0;
        const goalProgress = Math.min((totalCarbonSaved / weeklyGoal) * 100, 100);

        setWeeklyStats({
          totalActivities: activities.length,
          totalCarbonSaved,
          topCategory,
          kelpPointsEarned: Math.floor(totalCarbonSaved * 10 + activities.length * 5),
          streakDays: profile?.streak_count || 0,
          weeklyGoal,
          goalProgress
        });
      }
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      toast({
        title: "Error",
        description: "Failed to load weekly stats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        width: 380,
        height: 580,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `kelp-impact-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast({
        title: "Downloaded! 📱",
        description: "Your impact card has been saved"
      });
    } catch (error) {
      console.error("Error downloading card:", error);
      toast({
        title: "Error",
        description: "Failed to download card",
        variant: "destructive"
      });
    }
  };

  const shareCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        width: 380,
        height: 580,
        useCORS: true,
        allowTaint: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          try {
            await navigator.share({
              title: 'My Kelp Impact This Week 🌱',
              text: `Just crushed my eco goals this week! Check out my environmental impact on Kelp 💚 #KelpImpact #SustainableLiving`,
              files: [new File([blob], 'kelp-impact.png', { type: 'image/png' })]
            });
            
            toast({
              title: "Shared! 🚀",
              description: "Your impact has been shared successfully"
            });
          } catch (error) {
            if (error.name !== 'AbortError') {
              downloadCard();
            }
          }
        } else {
          downloadCard();
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error("Error sharing card:", error);
      toast({
        title: "Error",
        description: "Failed to share card",
        variant: "destructive"
      });
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'thrift_fit': '👕',
      'cycle_commute': '🚴‍♀️',
      'sustainable_food': '🥗',
      'eco_travel': '🌍',
      'zero_waste': '♻️',
      'renewable_energy': '⚡',
      'water_conservation': '💧',
      'default': '🌱'
    };
    return emojiMap[category] || emojiMap.default;
  };

  const getCategoryName = (category: string) => {
    const nameMap: Record<string, string> = {
      'thrift_fit': 'Thrift Fashion',
      'cycle_commute': 'Eco Commute',
      'sustainable_food': 'Green Eating',
      'eco_travel': 'Eco Travel',
      'zero_waste': 'Zero Waste',
      'renewable_energy': 'Clean Energy',
      'water_conservation': 'Water Save',
      'default': 'Eco Action'
    };
    return nameMap[category] || nameMap.default;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0 bg-transparent">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center text-white">Share Your Weekly Impact</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Mobile-Optimized Shareable Card */}
              <div
                ref={cardRef}
                className="w-full max-w-sm mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 rounded-3xl p-6 shadow-2xl border border-white/20"
                style={{ width: '360px', height: '560px' }}
              >
                {/* Header with Branding */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      Kelp
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <Calendar className="w-4 h-4" />
                    <p className="text-sm font-semibold">My Weekly Impact</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-6 bg-white/70 rounded-2xl p-4 backdrop-blur-sm shadow-sm">
                  <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100 text-emerald-700 font-bold text-lg">
                      {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg leading-tight">
                      {profile?.full_name || profile?.username || 'Eco Warrior'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 mt-1">
                      <Sparkles className="w-3 h-3" />
                      <span className="font-medium">
                        Week of {new Date().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Activities Count */}
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-4 text-center shadow-sm border border-purple-200/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-black text-purple-600">
                        {weeklyStats?.totalActivities || 0}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-purple-700">Activities</p>
                  </div>

                  {/* Carbon Saved */}
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl p-4 text-center shadow-sm border border-emerald-200/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Leaf className="w-5 h-5 text-emerald-600" />
                      <span className="text-2xl font-black text-emerald-600">
                        {weeklyStats?.totalCarbonSaved.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700">kg CO₂ Saved</p>
                  </div>

                  {/* Kelp Points */}
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4 text-center shadow-sm border border-amber-200/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="text-2xl font-black text-amber-600">
                        {weeklyStats?.kelpPointsEarned || 0}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-700">Points Earned</p>
                  </div>

                  {/* Streak */}
                  <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-4 text-center shadow-sm border border-rose-200/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-rose-600" />
                      <span className="text-2xl font-black text-rose-600">
                        {weeklyStats?.streakDays || 0}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-rose-700">Day Streak</p>
                  </div>
                </div>

                {/* Top Category & Goal Progress */}
                <div className="space-y-3 mb-6">
                  {/* Top Category */}
                  <div className="bg-white/80 rounded-2xl p-4 text-center shadow-sm border border-white/50">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-2xl">
                        {getCategoryEmoji(weeklyStats?.topCategory || 'default')}
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        {getCategoryName(weeklyStats?.topCategory || 'default')}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-600">Top Category This Week</p>
                  </div>

                  {/* Goal Progress */}
                  <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-white/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Weekly Goal</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {weeklyStats?.goalProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(weeklyStats?.goalProgress || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-3 font-medium">
                    🌱 Join me on my sustainability journey
                  </p>
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full px-4 py-2 inline-block shadow-lg">
                    <span className="text-xs font-bold text-white">
                      Download Kelp App
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  onClick={downloadCard}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
                <Button
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 shadow-lg"
                  onClick={shareCard}
                >
                  <Share className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareableCard;
