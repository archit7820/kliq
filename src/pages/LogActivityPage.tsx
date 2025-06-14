
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploadSection from '@/components/ImageUploadSection';
import ActivityAnalysisSection from '@/components/ActivityAnalysisSection';
import ActivitySubmissionSection from '@/components/ActivitySubmissionSection';

export interface ActivityAnalysis {
  carbon_footprint_kg: number;
  explanation: string;
  activity: string;
  emoji: string;
}

const LogActivityPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [analysis, setAnalysis] = useState<ActivityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/home')}
          className="text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Log Green Activity</h1>
      </header>

      <main className="flex-grow p-4 space-y-6 mb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <ImageUploadSection
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            caption={caption}
            setCaption={setCaption}
            onAnalyze={(url, cap) => {
              setIsAnalyzing(true);
              // The analysis will be handled by ActivityAnalysisSection
            }}
            disabled={isAnalyzing || isSubmitting}
          />

          {imageUrl && (
            <ActivityAnalysisSection
              imageUrl={imageUrl}
              caption={caption}
              analysis={analysis}
              setAnalysis={setAnalysis}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          )}

          {analysis && (
            <ActivitySubmissionSection
              analysis={analysis}
              setAnalysis={setAnalysis}
              imageUrl={imageUrl}
              caption={caption}
              userId={user.id}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onSuccess={() => {
                navigate('/feed');
              }}
            />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default LogActivityPage;
