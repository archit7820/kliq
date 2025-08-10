import React from "react";
import { Sparkles } from "lucide-react";

const ImpactScoreChip = ({
  scoreLabel = "Impact",
  scoreValue = "+0",
}: {
  scoreLabel?: string;
  scoreValue?: string;
}) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card shadow-sm hover-scale">
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
      <Sparkles className="w-3.5 h-3.5" />
    </span>
    <span className="text-xs text-muted-foreground">{scoreLabel}</span>
    <span className="text-xs font-semibold">{scoreValue}</span>
  </div>
);

export default ImpactScoreChip;
