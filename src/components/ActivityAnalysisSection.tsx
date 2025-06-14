
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Leaf } from 'lucide-react';
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
            <span className="text-base">Analyzing your activity...</span>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{analysis.emoji}</span>
          Analysis Results
        </CardTitle>
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
      </CardContent>
    </Card>
  );
};

export default ActivityAnalysisSection;
