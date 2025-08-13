import React from "react";
import { Button } from "@/components/ui/button";

interface LeaderboardFiltersProps {
  scope: "global" | "national" | "local" | "friends";
  onScopeChange: (scope: "global" | "national" | "local" | "friends") => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = ["All", "Cycling", "Thrift", "Food", "Travel", "Energy", "Transit"];

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  scope,
  onScopeChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Scope filter */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1 flex items-center gap-1 shadow-sm border border-white/20">
        {(["global", "national", "local", "friends"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={scope === s ? "default" : "ghost"}
            className={`rounded-lg px-4 py-2 h-9 text-sm font-medium transition-all ${
              scope === s 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
            }`}
            onClick={() => onScopeChange(s)}
          >
            {s === "global" && "🌍 Global"}
            {s === "national" && "🏛️ National"}
            {s === "local" && "📍 Local"}
            {s === "friends" && "👥 Friends"}
          </Button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-all btn-bounce ${
                active
                  ? "bg-emerald-500 text-white shadow-md border-emerald-400"
                  : "bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
              aria-pressed={active}
            >
              {cat === "All" && "🌟"}
              {cat === "Cycling" && "🚴"}
              {cat === "Thrift" && "♻️"}
              {cat === "Food" && "🥗"}
              {cat === "Travel" && "✈️"}
              {cat === "Energy" && "⚡"}
              {cat === "Transit" && "🚇"}
              <span className="ml-1">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardFilters;
