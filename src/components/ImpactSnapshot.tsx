
import React from "react";

/**
 * Renders a summary of impact across categories.
 * Props:
 *   impact: { food: number, travel: number, shopping: number }
 */
const ImpactSnapshot = ({ impact }: { impact: { food: number; travel: number; shopping: number } }) => (
  <div className="flex flex-row justify-between items-center gap-3 px-3 py-2 rounded-xl bg-card border text-sm shadow-sm">
    <div className="flex flex-col items-center">
      <span className="font-semibold text-foreground">{impact.food} kg</span>
      <span className="text-xs text-muted-foreground">Food</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="font-semibold text-foreground">{impact.travel} kg</span>
      <span className="text-xs text-muted-foreground">Travel</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="font-semibold text-foreground">{impact.shopping} kg</span>
      <span className="text-xs text-muted-foreground">Shopping</span>
    </div>
  </div>
);

export default ImpactSnapshot;

