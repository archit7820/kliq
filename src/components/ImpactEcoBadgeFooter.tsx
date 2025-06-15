
import React from "react";

// A set of fallback AI-generated tips if the user has no eco insights for the day
const DEFAULT_AI_TIPS = [
  "Try going car-free just one day a week to cut your carbon footprint! 🚲",
  "Switching to a plant-based meal today can save up to 2kg of CO₂e. 🥦",
  "Remember, every reused bag or bottle saves emissions and keeps our planet green! ♻️",
  "Unplug idle devices to curb phantom energy waste. Tiny habits add up! ⚡",
  "Shorten your shower and save both water and CO₂e in a single splash. 🚿",
  "Turn off lights when leaving the room—it's the easiest way to help Mother Earth! 💡",
  "Support local products—they typically travel less, cutting total emissions. 🛒",
];

type EcoInsight = { id: string; insight: string; created_at: string };
type ImpactEcoBadgeFooterProps = {
  ecoInsights: EcoInsight[];
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split("T")[0];
};

const pickRandomTip = () =>
  DEFAULT_AI_TIPS[Math.floor(Math.random() * DEFAULT_AI_TIPS.length)];

const ImpactEcoBadgeFooter: React.FC<ImpactEcoBadgeFooterProps> = ({ ecoInsights }) => {
  // Find the latest eco insight created today, if any
  const todayStr = getToday();
  const todayInsight = ecoInsights.find(i =>
    new Date(i.created_at).toISOString().startsWith(todayStr)
  );

  // Decide what to show: the insight for today, or a random tip
  const tipOrInsight = todayInsight
    ? todayInsight.insight
    : pickRandomTip();

  return (
    <div className="flex w-full flex-col justify-between mt-3 gap-2">
      <div className="rounded-xl border px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 shadow flex items-center gap-2">
        <span className="text-2xl mr-2" aria-label="AI tip">🤖</span>
        <span className="font-semibold text-green-900 text-base">
          Daily Green Thought by AI:
        </span>
      </div>
      <div className="px-4 py-1 flex items-center">
        <span className="text-green-700 text-base font-medium">{tipOrInsight}</span>
      </div>
    </div>
  );
};

export default ImpactEcoBadgeFooter;
