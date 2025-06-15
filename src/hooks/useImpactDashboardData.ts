
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuthStatus } from "./useAuthStatus";
import { startOfWeek, startOfMonth, startOfYear, format, addDays } from "date-fns";

function getWeekDaysArray() {
  const now = new Date();
  let week = [];
  for (let i = 0; i < 7; i++) {
    week.push(format(addDays(startOfWeek(now, { weekStartsOn: 1 }), i), "EEE")); // Mon, Tue...
  }
  return week;
}
function getMonthLabelsArray() {
  return Array.from({ length: 12 }).map((_, i) =>
    format(new Date(2020, i, 1), "MMM")
  );
}
function getYearLabelsArray() {
  const thisYear = new Date().getFullYear();
  return [
    `${thisYear - 3}`,
    `${thisYear - 2}`,
    `${thisYear - 1}`,
    `${thisYear}`
  ];
}

export function useImpactDashboardData() {
  const { user } = useAuthStatus();
  const userId = user?.id;

  const queryClient = useQueryClient();

  // Live activities for this user
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities", userId],
    queryFn: async () => {
      if (!userId) return [];
      const since = format(startOfYear(new Date()), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since);
      if (error) return [];
      return data || [];
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });

  // Eco insights for this user
  const { data: ecoInsights } = useQuery({
    queryKey: ["eco-insights", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("eco_insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  // Profile (kelp points, streak)
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  // --- Real time sync for all (profiles, activities, eco_insights, challenge_participants, challenges) ---
  useEffect(() => {
    if (!userId) return;
    const triggerRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["eco-insights", userId] });
      queryClient.invalidateQueries({ queryKey: ["activities", userId] });
    };
    const tables = [
      { table: "profiles", filterKey: "id", userKey: userId },
      { table: "eco_insights", filterKey: "user_id", userKey: userId },
      { table: "activities", filterKey: "user_id", userKey: userId }
    ];
    const channels = tables.map(({ table, filterKey, userKey }) =>
      supabase
        .channel(`impactdash:${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, ...(filterKey && userKey ? { filter: `${filterKey}=eq.${userKey}` } : {}) },
          triggerRefetch
        )
        .subscribe()
    );
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, [userId, queryClient]);

  /** ------- DATA AGGREGATION LOGIC -------------- **/

  // Helper to group by (mon,tue...) for week
  function weeklyChart() {
    const weekLabels = getWeekDaysArray();
    // For each day, sum total negative carbon (CO2 SAVED only!)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    let data = weekLabels.map((label, idx) => {
      const day = addDays(weekStart, idx);
      const dayStr = format(day, "yyyy-MM-dd");
      const saved = (activities || [])
        .filter(a => format(new Date(a.created_at), "yyyy-MM-dd") === dayStr && Number(a.carbon_footprint_kg) < 0)
        .reduce((acc, cur) => acc + Math.abs(Number(cur.carbon_footprint_kg)), 0);
      // breakdown by category
      const breakdown = (activities || [])
        .filter(a => format(new Date(a.created_at), "yyyy-MM-dd") === dayStr && Number(a.carbon_footprint_kg) < 0)
        .reduce((acc, cur) => {
          const cat = cur.category || "Other";
          acc[cat] = (acc[cat] || 0) + Math.abs(Number(cur.carbon_footprint_kg));
          return acc;
        }, {} as Record<string, number>);
      return { day: label, savings: saved, ...breakdown };
    });
    // sum for breakdown
    const breakdown = (activities || [])
      .filter(a => Number(a.carbon_footprint_kg) < 0)
      .reduce((tot, cur) => {
        const cat = cur.category || "Other";
        tot[cat] = (tot[cat] || 0) + Math.abs(Number(cur.carbon_footprint_kg));
        return tot;
      }, {} as Record<string, number>);
    return { chart: data, breakdown };
  }

  // For monthly bar
  function monthlyChart() {
    const monthLabels = getMonthLabelsArray();
    let monthTotals = monthLabels.map((month, i) => {
      const monthIdx = i;
      const saved = (activities || [])
        .filter(a => new Date(a.created_at).getMonth() === monthIdx && Number(a.carbon_footprint_kg) < 0)
        .reduce((acc, cur) => acc + Math.abs(Number(cur.carbon_footprint_kg)), 0);
      return { month, savings: saved };
    });
    // fake breakdown for now (optionally sum by category for all *this* month)
    let breakdown = (activities || [])
      .filter(a => format(new Date(a.created_at), "yyyy-MM") === format(new Date(), "yyyy-MM") && Number(a.carbon_footprint_kg) < 0)
      .reduce((tot, cur) => {
        const cat = cur.category || "Other";
        tot[cat] = (tot[cat] || 0) + Math.abs(Number(cur.carbon_footprint_kg));
        return tot;
      }, {} as Record<string, number>);
    return { chart: monthTotals, breakdown };
  }

  // For yearly line chart: last 4 years
  function yearlyChart() {
    const yearLabels = getYearLabelsArray();
    let yearTotals = yearLabels.map((year) => {
      const yr = Number(year);
      const saved = (activities || [])
        .filter(a => new Date(a.created_at).getFullYear() === yr && Number(a.carbon_footprint_kg) < 0)
        .reduce((acc, cur) => acc + Math.abs(Number(cur.carbon_footprint_kg)), 0);
      return { year, savings: saved };
    });
    // fake breakdown for now (sum last year by category)
    let breakdown = (activities || [])
      .filter(a => new Date(a.created_at).getFullYear() === new Date().getFullYear() && Number(a.carbon_footprint_kg) < 0)
      .reduce((tot, cur) => {
        const cat = cur.category || "Other";
        tot[cat] = (tot[cat] || 0) + Math.abs(Number(cur.carbon_footprint_kg));
        return tot;
      }, {} as Record<string, number>);
    return { chart: yearTotals, breakdown };
  }

  // Streak: compute longest & current based on activity days
  function computeStreak() {
    if (!activities || !activities.length) return { current: 0, best: 0 };
    // days user logged at least one activity
    const daysSet = Array.from(
      new Set(activities.map(a => format(new Date(a.created_at), "yyyy-MM-dd")))
    ).sort();
    // find max streak and current streak
    let best = 1, current = 1;
    for(let i=1; i<daysSet.length; i++) {
      const prev = new Date(daysSet[i-1]);
      const curr = new Date(daysSet[i]);
      if((curr.getTime() - prev.getTime()) / (1000*60*60*24) === 1) {
        current++;
      } else { current = 1; }
      best = Math.max(best, current);
    }
    // To show "days in a row ending today"
    const today = format(new Date(), "yyyy-MM-dd");
    let currStreak = 0;
    for(let i = daysSet.length-1; i >= 0; i--) {
      const day = daysSet[i];
      if (format(new Date(today), "yyyy-MM-dd") == day ||
          (new Date(today).getTime() - new Date(day).getTime()) / (1000*60*60*24) === currStreak) {
        currStreak++;
      } else break;
    }
    return { current: currStreak, best };
  }

  // Milestone detection (dummy logic for now: first action, 1 week, 100kg saved)
  function getMilestones() {
    const totalSaved = (activities || [])
      .filter(a => Number(a.carbon_footprint_kg) < 0)
      .reduce((sum, cur) => sum + Math.abs(Number(cur.carbon_footprint_kg)), 0);
    return [
      {
        label: "First Action",
        description: "Logged your first activity",
        achieved: (activities || []).length > 0
      },
      {
        label: "One Week Streak",
        description: "7 days of logging",
        achieved: computeStreak().best >= 7 || computeStreak().current >= 7
      },
      {
        label: "100kg CO₂e Saved",
        description: "Big milestone!",
        achieved: totalSaved >= 100
      }
    ];
  }

  // Latest breakdown for "category breakdown" (this week)
  const { chart: weekChart, breakdown: weekBreakdown } = weeklyChart();
  const { chart: monthChart, breakdown: monthBreakdown } = monthlyChart();
  const { chart: yearChart, breakdown: yearBreakdown } = yearlyChart();

  const streak = computeStreak();
  const milestones = getMilestones();

  return {
    activities: activities || [],
    activitiesLoading,
    ecoInsights: ecoInsights || [],
    profile,
    weekChart,
    weekBreakdown,
    monthChart,
    monthBreakdown,
    yearChart,
    yearBreakdown,
    streak,
    milestones
  };
}
