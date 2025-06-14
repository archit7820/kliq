
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Plane, Utensils, Home, ShoppingCart, Bolt, HelpCircle, Star, Trophy, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

const categoryIcons: { [key: string]: React.ElementType } = {
  Travel: Plane,
  Food: Utensils,
  Home: Home,
  Shopping: ShoppingCart,
  Utilities: Bolt,
  Other: HelpCircle,
};

const categoryColors: { [key: string]: string } = {
    Travel: 'bg-blue-100 text-blue-800',
    Food: 'bg-orange-100 text-orange-800',
    Home: 'bg-green-100 text-green-800',
    Shopping: 'bg-purple-100 text-purple-800',
    Utilities: 'bg-yellow-100 text-yellow-800',
    Other: 'bg-gray-100 text-gray-800',
};

// Feel free to adjust the monthly target for gamification!
const MONTHLY_TARGET = 20; // a target for net reduction (kg CO₂e)---adjust as fits

interface CarbonOverviewProps {
  data: { category: string; total_carbon: number }[];
}

const CarbonOverview: React.FC<CarbonOverviewProps> = ({ data }) => {
  const [liveData, setLiveData] = useState(data);
  const [animatedFootprint, setAnimatedFootprint] = useState<number | null>(null);
  const totalFootprint = liveData.reduce((sum, item) => sum + item.total_carbon, 0);
  const isNetNegative = totalFootprint < 0;
  const progress = Math.min(100, Math.abs(totalFootprint) / MONTHLY_TARGET * 100);

  // For number animation when balance updates
  const prevValue = useRef(totalFootprint);
  useEffect(() => {
    let raf: number;
    let frame = 0;
    const animate = () => {
      if(frame >= 15){
        setAnimatedFootprint(totalFootprint);
        return;
      }
      const next = prevValue.current + (totalFootprint - prevValue.current) * (frame / 15);
      setAnimatedFootprint(next);
      frame++;
      raf = requestAnimationFrame(animate);
    };
    animate();
    prevValue.current = totalFootprint;
    return () => cancelAnimationFrame(raf);
  }, [totalFootprint]);

  // Real-time updates via Supabase subscription
  useEffect(() => {
    setLiveData(data); // Set new data on prop change

    // This effect listens for activities for the current month by the current user
    // We'll re-fetch by using the same logic on change (let the parent control user/period via props)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        (payload) => {
          // Callback fires on INSERT/UPDATE/DELETE.
          // Parent will likely also be fetching these, but for now, refetch everything…
          window.location.reload(); // crude, but will invoke new prop; alternative: fire a re-fetch or notify parent!
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data]);

  // Gamified badge logic
  function getStatusBadge() {
    if (isNetNegative) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-200/80 text-green-800 shadow animate-bounce">
          <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
          Net Negative!
        </span>
      );
    }
    if (progress >= 100) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-200/80 text-yellow-800 shadow animate-bounce">
          <Trophy className="w-4 h-4 text-yellow-500 animate-wiggle" />
          Target Smashed!
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-200/70 text-red-800">
        Net Positive
      </span>
    );
  }

  return (
    <Card className="w-full bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden animate-fade-in">
      <div className={`p-6 ${isNetNegative ? 'bg-gradient-to-br from-teal-50 to-green-100' : 'bg-gradient-to-br from-rose-50 to-orange-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Carbon Balance
            {progress >= 100 && (
              <Star className="ml-1 w-4 h-4 text-yellow-400 animate-bounce" />
            )}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <div className="text-center">
          <p className={`text-5xl font-bold transition-all duration-700 ${isNetNegative ? 'text-green-600' : 'text-red-500'} ${animatedFootprint !== null && animatedFootprint !== totalFootprint ? 'animate-bounce' : ''}`}>
            {animatedFootprint === null
              ? Math.abs(totalFootprint).toFixed(2)
              : Math.abs(animatedFootprint).toFixed(2)}
          </p>
          <p className="text-sm font-medium text-gray-600">kg CO₂e</p>
          <p className="text-xs text-gray-500 mt-1">This month's balance</p>
          <div className="mt-4">
            <Progress value={progress} className={`h-3 rounded-md transition-all duration-500 bg-gray-100 ${isNetNegative ? "bg-green-200" : "bg-red-100"}`} />
            <p className="text-xs text-gray-500 pt-1">{progress >= 100 ? "🎉 Monthly Target Achieved!" : `Goal: ${MONTHLY_TARGET} kg CO₂e`}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Breakdown by Category</p>
        <div className="grid grid-cols-3 gap-3">
          {liveData && liveData.length > 0 ? (
            liveData.sort((a,b) => b.total_carbon - a.total_carbon).map(({ category, total_carbon }) => {
              const Icon = categoryIcons[category] || HelpCircle;
              const colors = categoryColors[category] || categoryColors.Other;
              return (
                <div key={category} className={`p-3 rounded-xl flex flex-col items-center justify-center text-center ${colors} transition-all hover:scale-105 shadow-sm cursor-pointer`}>
                  <Icon className="w-6 h-6 mb-1.5 animate-fade-in" />
                  <p className="font-semibold text-sm">{category}</p>
                  <p className="text-xs font-medium">{total_carbon.toFixed(1)} kg</p>
                </div>
              );
            })
          ) : (
            <p className="col-span-3 text-center text-sm text-gray-500 py-4">Log an activity to see your breakdown.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarbonOverview;
