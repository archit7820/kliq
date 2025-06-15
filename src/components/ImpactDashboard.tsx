
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BadgeDollarSign, Flame, Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { useImpactDashboardData } from "@/hooks/useImpactDashboardData";
import { toast } from "@/components/ui/use-toast";

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

  let chartData, ChartComponent, xKey, yKey, breakdown;
  if (tab === "week") {
    chartData = weekChart;
    ChartComponent = AreaChart;
    xKey = "day";
    yKey = "savings";
    breakdown = weekBreakdown;
  } else if (tab === "month") {
    chartData = monthChart;
    ChartComponent = BarChart;
    xKey = "month";
    yKey = "savings";
    breakdown = monthBreakdown;
  } else {
    chartData = yearChart;
    ChartComponent = LineChart;
    xKey = "year";
    yKey = "savings";
    breakdown = yearBreakdown;
  }

  // Figure out category breakdown coloring (by category key)
  const showBreakdown = Object.keys(breakdown || {}).length > 0;

  // Handler for manual insights generation
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

  // Show eco insights (always show, real-time updates)
  return (
    <Card className="w-full bg-white rounded-2xl shadow-xl border">
      <div className="p-5 border-b bg-gradient-to-r from-teal-50 to-green-100">
        <CardTitle className="text-lg font-bold flex gap-2 items-center mb-2">
          Impact Dashboard
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-2 cursor-help inline-block align-middle">
                <svg width={18} height={18} strokeWidth={2} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10B981"/><path d="M12 16v-2m0-5v.01" stroke="#10B981" strokeLinecap="round"/><circle cx="12" cy="12" r="10"/></svg>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              View your CO₂e savings trends and progress.
            </TooltipContent>
          </Tooltip>
          {/* Manual Insights Button */}
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
          {tab === "week" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="90%" stopColor="#bbf7d0" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey={xKey}/>
                <YAxis tickFormatter={v => `${v}kg`} width={40}/>
                <CartesianGrid strokeDasharray="3 3"/>
                <ChartTooltip/>
                <Area type="monotone" dataKey="savings" name="CO₂e Saved" stroke="#10B981" fill="url(#colorSavings)" strokeWidth={3} />
                <Legend/>
              </AreaChart>
            </ResponsiveContainer>
          )}
          {tab === "month" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey={xKey}/>
                <YAxis tickFormatter={v => `${v}kg`} width={40}/>
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip/>
                <Bar dataKey={yKey} name="CO₂e Saved" fill="#10B981" radius={[4, 4, 0, 0]}/>
                <Legend/>
              </BarChart>
            </ResponsiveContainer>
          )}
          {tab === "year" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey={xKey}/>
                <YAxis tickFormatter={v => `${v}kg`} width={40}/>
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip/>
                <Line type="monotone" dataKey={yKey} name="CO₂e Saved" stroke="#38bdf8" strokeWidth={3} dot={{ stroke: "#10B981", strokeWidth: 2 }} />
                <Legend/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <CardContent>
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-3 mb-4">
          {/* Category breakdown */}
          <div className="flex flex-col gap-1 bg-green-50 px-3 py-2 rounded-lg border border-green-100 text-xs shadow-inner">
            <span className="font-bold text-green-700 mb-1">Category Breakdown</span>
            <div className="flex flex-row gap-4 items-center">
              {showBreakdown ? (
                Object.entries(breakdown)
                  .sort(([,aVal],[,bVal]) => Number(bVal) - Number(aVal))
                  .map(([k, v]) => {
                    let color = "text-green-700";
                    if (/travel/i.test(k)) color = "text-blue-500";
                    else if (/food/i.test(k)) color = "text-orange-500";
                    else if (/shop/i.test(k)) color = "text-fuchsia-700";
                    else if (/home/i.test(k)) color = "text-green-700";
                    else if (/util/i.test(k)) color = "text-yellow-700";
                    return <span key={k} className={color}>{k}: <b>{Number(v).toFixed(1)}</b>kg</span>;
                  })
                ) : <span className="text-gray-400">No data yet</span>
              }
            </div>
          </div>
          {/* Streak highlight */}
          <div className="flex flex-row gap-2 items-center bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 text-xs shadow-inner">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-orange-700 font-semibold">{streak.current} day streak</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-gray-400 ml-1">ℹ️</span>
              </TooltipTrigger>
              <TooltipContent side="top">Days in a row you've logged actions</TooltipContent>
            </Tooltip>
          </div>
          {/* Milestones */}
          <div className="flex flex-row gap-2 items-center bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 text-xs shadow-inner">
            <Trophy className="w-5 h-5 text-yellow-500"/>
            <span>Milestones:</span>
            <div className="flex gap-1">
              {milestones.map(m => (
                <Tooltip key={m.label}>
                  <TooltipTrigger asChild>
                    <span className={m.achieved ? "" : "opacity-40"}>
                      {m.label === "First Action" && <BadgeDollarSign className="w-5 h-5 text-green-500" />}
                      {m.label === "One Week Streak" && <Flame className="w-5 h-5 text-orange-500" />}
                      {m.label === "100kg CO₂e Saved" && <Trophy className="w-5 h-5 text-yellow-500" />}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div>
                      <b>{m.label}</b>
                    </div>
                    <div>{m.description}</div>
                    {!m.achieved && <div className="text-orange-500 mt-1">Not achieved yet</div>}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
        {/* Eco Badge Footer */}
        <div className="flex w-full justify-between items-center flex-wrap mt-3 gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 border text-xs text-gray-700 shadow">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/OpenAI_Logo.svg"
              alt="OpenAI"
              width={20}
              height={20}
              style={{ display: 'inline', verticalAlign: 'middle' }}
            />
            <span className="font-semibold">Eco insights powered by OpenAI</span>
          </span>
          {/* Live insights */}
          <div className="flex flex-col items-end gap-0">
            <span className="text-[12px] mb-1 font-semibold text-green-700">Your Latest Eco Insights:</span>
            <ol className="text-green-700 text-xs text-right">
              {ecoInsights.length === 0 && (
                <span className="text-gray-400 text-xs">No eco insights yet.</span>
              )}
              {ecoInsights.slice(0,2).map((i: any) =>
                <li key={i.id} className="mb-0.5">
                  {i.insight} <span className="block text-[10px] text-gray-400">{new Date(i.created_at).toLocaleDateString()}</span>
                </li>
              )}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

