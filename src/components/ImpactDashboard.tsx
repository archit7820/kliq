
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

// Example mock data, replace with Supabase data later if needed
const last7Days = [
  { day: "Mon", savings: 1.1, travel: 0.6, food: 0.3, shopping: 0.2 },
  { day: "Tue", savings: 1.4, travel: 0.8, food: 0.4, shopping: 0.2 },
  { day: "Wed", savings: 1.7, travel: 1.1, food: 0.3, shopping: 0.3 },
  { day: "Thu", savings: 0.9, travel: 0.3, food: 0.4, shopping: 0.2 },
  { day: "Fri", savings: 1.2, travel: 0.5, food: 0.4, shopping: 0.3 },
  { day: "Sat", savings: 0.7, travel: 0.2, food: 0.3, shopping: 0.2 },
  { day: "Sun", savings: 1.0, travel: 0.6, food: 0.3, shopping: 0.1 },
];

const last12Months = [
  { month: "Jan", savings: 12 },
  { month: "Feb", savings: 15 },
  { month: "Mar", savings: 18 },
  { month: "Apr", savings: 14 },
  { month: "May", savings: 20 },
  { month: "Jun", savings: 21 },
  { month: "Jul", savings: 19 },
  { month: "Aug", savings: 23 },
  { month: "Sep", savings: 14 },
  { month: "Oct", savings: 18 },
  { month: "Nov", savings: 15 },
  { month: "Dec", savings: 20 },
];

const last4Years = [
  { year: "2022", savings: 110 },
  { year: "2023", savings: 165 },
  { year: "2024", savings: 220 },
  { year: "2025", savings: 100 }, // Replace with actual
];

const milestones = [
  { label: "First Action", description: "Logged your first activity", achieved: true, icon: <BadgeDollarSign className="w-5 h-5 text-green-500" /> },
  { label: "One Week Streak", description: "7 days of logging", achieved: true, icon: <Flame className="w-5 h-5 text-orange-500" /> },
  { label: "100kg CO₂e Saved", description: "Big milestone!", achieved: false, icon: <Trophy className="w-5 h-5 text-yellow-500" /> },
];

const tabOptions = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" }
];

export default function ImpactDashboard() {
  const [tab, setTab] = useState("week");
  let chartData, ChartComponent, xKey, yKey, breakdown;
  if (tab === "week") {
    chartData = last7Days;
    ChartComponent = AreaChart;
    xKey = "day";
    yKey = "savings";
    breakdown = chartData.reduce(
      (acc, d) => {
        acc.travel += d.travel;
        acc.food += d.food;
        acc.shopping += d.shopping;
        return acc;
      },
      { travel: 0, food: 0, shopping: 0 }
    );
  } else if (tab === "month") {
    chartData = last12Months;
    ChartComponent = BarChart;
    xKey = "month";
    yKey = "savings";
    breakdown = { travel: 9, food: 7, shopping: 4 }; // replace with actual
  } else {
    chartData = last4Years;
    ChartComponent = LineChart;
    xKey = "year";
    yKey = "savings";
    breakdown = { travel: 48, food: 46, shopping: 37 }; // replace with actual
  }

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
              View your CO₂e savings trends and progress. Data is for illustration.
            </TooltipContent>
          </Tooltip>
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
              <span className="text-blue-500">Travel: <b>{breakdown.travel.toFixed(1)}</b>kg</span>
              <span className="text-orange-500">Food: <b>{breakdown.food.toFixed(1)}</b>kg</span>
              <span className="text-fuchsia-700">Shopping: <b>{breakdown.shopping.toFixed(1)}</b>kg</span>
            </div>
          </div>
          {/* Streak highlight */}
          <div className="flex flex-row gap-2 items-center bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 text-xs shadow-inner">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-orange-700 font-semibold">7 day streak</span>
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
                    <span className={m.achieved ? "" : "opacity-40"}>{m.icon}</span>
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
        <div className="flex w-full justify-end mt-3">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 border text-xs text-gray-700 shadow">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Google_Gemini_logo.svg" alt="Gemini" width={20} height={20} style={{ display: 'inline', verticalAlign: 'middle' }}/>
            <span className="font-semibold">Eco insights powered by Gemini</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * How to use:
 * 1. Import and add <ImpactDashboard /> to your home/dashboard page (suggested: HomeContent or DashboardSummary)
 * 2. Replace mock data with live data as needed.
 */
