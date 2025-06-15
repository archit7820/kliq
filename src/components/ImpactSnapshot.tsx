
import React from "react";

/**
 * Renders a summary of impact across categories.
 * Props:
 *   impact: { food: number, travel: number, shopping: number }
 */
const ImpactSnapshot = ({ impact }: { impact: { food: number; travel: number; shopping: number } }) => (
  <div className="flex flex-row justify-between items-center gap-3 px-3 py-2 rounded-xl bg-white border text-sm shadow-sm">
    <div className="flex flex-col items-center">
      <span className="font-semibold text-green-700">{impact.food} kg</span>
      <span className="text-xs text-gray-500">Food</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="font-semibold text-blue-700">{impact.travel} kg</span>
      <span className="text-xs text-gray-500">Travel</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="font-semibold text-fuchsia-700">{impact.shopping} kg</span>
      <span className="text-xs text-gray-500">Shopping</span>
    </div>
  </div>
);

export default ImpactSnapshot;

