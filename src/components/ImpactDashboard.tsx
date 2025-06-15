
import React, { useState } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { useImpactDashboardData } from "@/hooks/useImpactDashboardData";
import { toast } from "@/components/ui/use-toast";
import ImpactChart from "./ImpactChart";
import ImpactHighlightsRow from "./ImpactHighlightsRow";
import ImpactEcoBadgeFooter from "./ImpactEcoBadgeFooter";

// Use the reusable hook
const tabOptions = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" }
];

export default function ImpactDashboard() {
  const [tab, setTab] = useState("week");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const {
    profile,
    ecoInsights,
    weekChart, weekBreakdown,
    monthChart, monthBreakdown,
    yearChart, yearBreakdown,
    streak,
    milestones
  } = useImpactDashboardData();

  let chartData, chartType, xKey, yKey, breakdown;
  if (tab === "week") {
    chartData = weekChart;
    chartType = "area";
    xKey = "day";
    yKey = "savings";
    breakdown = weekBreakdown;
  } else if (tab === "month") {
    chartData = monthChart;
    chartType = "bar";
    xKey = "month";
    yKey = "savings";
    breakdown = monthBreakdown;
  } else {
    chartData = yearChart;
    chartType = "line";
    xKey = "year";
    yKey = "savings";
    breakdown = yearBreakdown;
  }

  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    try {
      const response = await fetch(
        "https://tdqdeddshvjlqmefxwzj.functions.supabase.co/generate_daily_eco_insights",
        { method: "POST" }
      );
      const result = await response.json();
      if (response.ok && result.ok) {
        toast({
          title: "Insights Created",
          description: `${result.insightsCreated} new insights generated for today!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Insight Generation Failed",
          description: result.error || "Could not generate insights.",
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Insight Generation Failed",
        description: e.message || "Could not generate insights.",
      });
    }
    setLoadingInsight(false);
  };

  return (
    <Card className="w-full bg-white rounded-2xl shadow-xl border">
      <div className="p-5 border-b bg-gradient-to-r from-teal-50 to-green-100">
        <CardTitle className="text-lg font-bold flex gap-2 items-center mb-2">
          Impact Dashboard
          {/* Info tooltip and manual insights button */}
          <span className="ml-2 cursor-help inline-block align-middle">
            <svg width={18} height={18} strokeWidth={2} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10B981"/><path d="M12 16v-2m0-5v.01" stroke="#10B981" strokeLinecap="round"/><circle cx="12" cy="12" r="10"/></svg>
          </span>
          <button
            className={`ml-auto px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40`}
            disabled={loadingInsight}
            onClick={handleGenerateInsights}
            title="Generate today's eco insights for all active users"
            type="button"
          >
            {loadingInsight ? "Generating..." : "Generate Insights Now"}
          </button>
        </CardTitle>
        <div className="flex gap-2 my-2">
          {tabOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${tab === opt.value ? "bg-green-500 text-white shadow" : "bg-white text-green-700 border"}`}
              onClick={() => setTab(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ width: "100%", height: 250 }}>
          <ImpactChart data={chartData} chartType={chartType} xKey={xKey} yKey={yKey}/>
        </div>
      </div>
      <CardContent>
        <ImpactHighlightsRow breakdown={breakdown} streak={streak} milestones={milestones} />
        <ImpactEcoBadgeFooter ecoInsights={ecoInsights} />
      </CardContent>
    </Card>
  );
}
