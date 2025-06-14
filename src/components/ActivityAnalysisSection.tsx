
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivityAnalysis } from '@/pages/LogActivityPage';

interface ActivityAnalysisSectionProps {
  imageUrl: string;
  caption: string;
  analysis: ActivityAnalysis | null;
  setAnalysis: (analysis: ActivityAnalysis | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

const ActivityAnalysisSection: React.FC<ActivityAnalysisSectionProps> = ({
  imageUrl,
  caption,
  analysis,
  setAnalysis,
  isAnalyzing,
  setIsAnalyzing
}) => {

  useEffect(() => {
    if (imageUrl && !analysis && !isAnalyzing) {
      analyzeActivity();
    }
  }, [imageUrl, caption]);

  const analyzeActivity = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-activity', {
        body: { imageUrl, caption }
      });

      if (error) {
        throw error;
      }

      setAnalysis(data);
      toast.success('Activity analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze activity. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
