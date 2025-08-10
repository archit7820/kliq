
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Leaf } from 'lucide-react';
import ImpactScoreBreakdown from '@/components/ImpactScoreBreakdown';
import ImpactScoreChip from '@/components/ImpactScoreChip';
import { ActivityAnalysis } from '@/pages/LogActivityPage';

interface ActivityAnalysisSectionProps {
  analysis: ActivityAnalysis | null;
  isAnalyzing: boolean;
}

const ActivityAnalysisSection: React.FC<ActivityAnalysisSectionProps> = ({
  analysis,
  isAnalyzing,
}) => {

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            <span className="text-base">Scoring your adventure...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const isOffset = analysis.carbon_footprint_kg < 0;
  const displayValue = Math.abs(analysis.carbon_footprint_kg);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{analysis.emoji}</span>
          Adventure Analysis
        </CardTitle>
        <ImpactScoreChip scoreLabel="Impact" scoreValue={`${Math.round(analysis.impact_score ?? 0)}`} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{analysis.activity}</h3>
          <p className="text-muted-foreground">{analysis.explanation}</p>
        </div>

        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          isOffset 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <Leaf className={`w-6 h-6 ${isOffset ? 'text-green-600' : 'text-orange-600'}`} />
          <div>
            <div className={`text-lg font-bold ${isOffset ? 'text-green-700' : 'text-orange-700'}`}>
              {displayValue.toFixed(1)} kg CO₂e {isOffset ? 'saved' : 'produced'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isOffset ? 'Great job! This activity helps the environment.' : 'Consider offsetting this impact.'}
            </div>
          </div>
        </div>

        {analysis.dimensions && (
          <ImpactScoreBreakdown dimensions={analysis.dimensions} impactScore={analysis.impact_score} />
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityAnalysisSection;
