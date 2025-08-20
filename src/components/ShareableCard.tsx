
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Download, Share, Leaf, Zap, TrendingUp } from "lucide-react";
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

        setWeeklyStats({
          totalActivities: activities.length,
          totalCarbonSaved,
          topCategory,
          kelpPointsEarned: Math.floor(totalCarbonSaved * 10 + activities.length * 5)
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
        scale: 2,
        width: 400,
        height: 600
      });

      const link = document.createElement('a');
      link.download = `kelp-impact-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Downloaded!",
        description: "Your impact card has been saved to your device"
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
        scale: 2,
        width: 400,
        height: 600
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          try {
            await navigator.share({
              title: 'My Kelp Impact This Week',
              text: `Check out my environmental impact this week on Kelp! 🌱`,
              files: [new File([blob], 'kelp-impact.png', { type: 'image/png' })]
            });
          } catch (error) {
            // Fallback to download if sharing fails
            downloadCard();
          }
        } else {
          // Fallback to download if sharing not supported
          downloadCard();
        }
      }, 'image/png');
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
      'cycle_commute': '🚴',
      'sustainable_food': '🥗',
      'eco_travel': '🌍',
      'zero_waste': '♻️',
      'default': '🌱'
    };
    return emojiMap[category] || emojiMap.default;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-center">Share Your Impact</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Shareable Card */}
              <div
                ref={cardRef}
                className="w-full max-w-sm mx-auto bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 shadow-lg"
                style={{ width: '350px', height: '500px' }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-primary">Kelp</span>
                  </div>
                  <p className="text-sm text-muted-foreground">My Weekly Impact</p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {profile?.full_name || profile?.username || 'Eco Warrior'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="space-y-4 mb-6">
                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {weeklyStats?.totalActivities || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Eco Activities</p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {weeklyStats?.totalCarbonSaved.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-xl">
                        {getCategoryEmoji(weeklyStats?.topCategory || 'default')}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {weeklyStats?.topCategory?.replace('_', ' ') || 'Eco Activity'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Top Category</p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        {weeklyStats?.kelpPointsEarned || 0}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Kelp Points Earned</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Join me on my sustainability journey
                  </p>
                  <div className="bg-primary/10 rounded-full px-3 py-1 inline-block">
                    <span className="text-xs font-medium text-primary">
                      Download Kelp App
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={downloadCard}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  className="flex-1"
                  onClick={shareCard}
                >
                  <Share className="w-4 h-4 mr-2" />
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
