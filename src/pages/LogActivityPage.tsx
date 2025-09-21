
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploadSection from '@/components/ImageUploadSection';
import ActivityAnalysisSection from '@/components/ActivityAnalysisSection';
import ActivitySubmissionSection from '@/components/ActivitySubmissionSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityAnalysis {
  carbon_footprint_kg: number;
  explanation: string;
  activity: string;
  emoji: string;
  impact_score?: number; // 0-100
  authenticity_score?: number; // 0-1
  social_proof_weight?: number; // default 1.0 from server
  dimensions?: {
    adventure_intensity: number;
    social_connection: number;
    environmental_impact: number;
    economic_impact: number;
    learning_growth: number;
  };
}

const LogActivityPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [analysis, setAnalysis] = useState<ActivityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);

  // SEO: dynamic title and description
  useEffect(() => {
    document.title = "Log IRL Adventure | Kelp Impact";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Capture your IRL adventures, get a Kelp Impact Score, and turn effort into social currency.');
    }
  }, []);

  // Check for pre-filled data from community/challenge actions
  useEffect(() => {
    const storedData = localStorage.getItem('pendingActivityLog');
    const challengeData = localStorage.getItem('challengeCompletionData');
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setPrefilledData(data);
        setCaption(data.prefilledCaption || '');
        
        // Create a pre-filled analysis if we have the data
        if (data.prefilledActivity) {
          const preAnalysis: ActivityAnalysis = {
            activity: data.prefilledActivity,
            explanation: `Great job ${data.actionType === 'challenge' ? 'completing this challenge' : 'joining this community'}! This shows your commitment to positive impact.`,
            emoji: data.actionType === 'challenge' ? '🏆' : '🤝',
            carbon_footprint_kg: 0, // No carbon impact for digital actions
            impact_score: 75,
            dimensions: {
              adventure_intensity: data.actionType === 'challenge' ? 80 : 40,
              social_connection: 90,
              environmental_impact: 60,
              economic_impact: 30,
              learning_growth: 70,
            }
          };
          setAnalysis(preAnalysis);
        }
        
        // Clear the stored data
        localStorage.removeItem('pendingActivityLog');
      } catch (error) {
        console.error('Error parsing pre-filled data:', error);
        localStorage.removeItem('pendingActivityLog');
      }
    }
    
    // Handle challenge completion data (with uploaded image)
    if (challengeData) {
      try {
        const data = JSON.parse(challengeData);
        setImageUrl(data.imageUrl);
        setCaption(data.caption || '');
        
        // Create analysis for challenge completion
        const challengeAnalysis: ActivityAnalysis = {
          activity: `Completed challenge verification`,
          explanation: data.offset 
            ? `Verified by photo. ${data.offset ? `(Offset: ${-Math.abs(data.offset)} CO₂e kg)` : ""}`
            : "Verified by photo.",
          emoji: '🏆',
          carbon_footprint_kg: data.offset ? -Math.abs(data.offset) : 0,
          impact_score: 85,
          dimensions: {
            adventure_intensity: 85,
            social_connection: 80,
            environmental_impact: data.offset ? 90 : 60,
            economic_impact: 40,
            learning_growth: 75,
          }
        };
        setAnalysis(challengeAnalysis);
        
        // Don't clear challenge data here - let ActivitySubmissionSection handle it
      } catch (error) {
        console.error('Error parsing challenge data:', error);
        localStorage.removeItem('challengeCompletionData');
      }
    }
  }, []);

  const analyzeActivity = async () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);
    setAnalysis(null);
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
        <h1 className="text-xl font-bold text-foreground">Log IRL Adventure</h1>
      </header>

      <main className="flex-grow p-4 space-y-6 mb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <ImageUploadSection
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            caption={caption}
            setCaption={setCaption}
            onAnalyze={analyzeActivity}
            disabled={isAnalyzing || isSubmitting}
          />

          {imageUrl && (
            <ActivityAnalysisSection
              analysis={analysis}
              isAnalyzing={isAnalyzing}
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
