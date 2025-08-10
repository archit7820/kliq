import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ImpactScoreChip from "@/components/ImpactScoreChip";

type Dimensions = {
  adventure_intensity: number;
  social_connection: number;
  environmental_impact: number;
  economic_impact: number;
  learning_growth: number;
};

const friendly: Record<keyof Dimensions, string> = {
  adventure_intensity: "Adventure Intensity",
  social_connection: "Social Connection",
  environmental_impact: "Environmental Impact",
  economic_impact: "Economic Impact",
  learning_growth: "Learning & Growth",
};

export default function ImpactScoreBreakdown({
  dimensions,
  impactScore,
}: {
  dimensions: Dimensions;
  impactScore?: number;
}) {
  if (!dimensions) return null;

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Kelp Impact Score</CardTitle>
        <ImpactScoreChip scoreLabel="Score" scoreValue={`${Math.round(impactScore ?? 0)}`} />
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(dimensions).map(([key, val]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{friendly[key as keyof Dimensions]}</span>
              <span className="font-medium">{Math.round(Number(val) || 0)}/100</span>
            </div>
            <Progress value={Math.max(0, Math.min(100, Number(val) || 0))} />
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-1">IRL adventures are measured across effort, social, planet, economic, and growth dimensions — converted into social currency.</p>
      </CardContent>
    </Card>
  );
}
