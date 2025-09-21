
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Edit3, Check, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivityAnalysis } from '@/pages/LogActivityPage';
import { useQueryClient } from '@tanstack/react-query';

// List of green activity keywords from the migration—update to reflect backend logic:
const GREEN_ACTIVITY_KEYWORDS = [
  'walk', 'run', 'cycle', 'bike', 'plant', 'tree', 'public transport',
  'carpool', 'recycl', 'compost', 'solar', 'bus', 'train', 'subway', 'skate', 'scooter'
];

// Helper to detect if string is a green activity (used for frontend hints, backend enforces actual value)
function isGreenActivity(activity: string) {
  if (!activity) return false;
  const lower = activity.toLowerCase();
  return GREEN_ACTIVITY_KEYWORDS.some(keyword => lower.includes(keyword));
}

interface ActivitySubmissionSectionProps {
  analysis: ActivityAnalysis;
  setAnalysis: (analysis: ActivityAnalysis) => void;
  imageUrl: string | null;
  caption: string;
  userId: string;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  onSuccess: () => void;
}

const ActivitySubmissionSection: React.FC<ActivitySubmissionSectionProps> = ({
  analysis,
  setAnalysis,
  imageUrl,
  caption,
  userId,
  isSubmitting,
  setIsSubmitting,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(analysis.carbon_footprint_kg.toString());

  // Detect if this is a green activity for UI hints
  const isGreen = useMemo(() => isGreenActivity(analysis.activity), [analysis.activity]);

  const handleEditSave = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue)) {
      setAnalysis({
        ...analysis,
        carbon_footprint_kg: newValue
      });
      setIsEditing(false);
      toast.success('Carbon footprint updated');
    } else {
      toast.error('Please enter a valid number');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get URL parameters for community/challenge linking
      const urlParams = new URLSearchParams(window.location.search);
      const communityId = urlParams.get('community_id');
      const challengeId = urlParams.get('challenge_id');
      const autoJoin = urlParams.get('auto_join') === 'true';

      // Check if this is from pre-filled data (community/challenge action)
      const prefilledData = localStorage.getItem('pendingActivityLog');
      const challengeCompletionData = localStorage.getItem('challengeCompletionData');
      
      let activityData: any = {
        user_id: userId,
        activity: analysis.activity,
        carbon_footprint_kg: analysis.carbon_footprint_kg,
        explanation: analysis.explanation,
        emoji: analysis.emoji,
        image_url: imageUrl,
        caption: caption || null,
        category: 'general'
      };

      // If there's prefilled data, use its category
      if (prefilledData) {
        try {
          const data = JSON.parse(prefilledData);
          activityData.category = data.category || 'general';
          // Clear the prefilled data after using it
          localStorage.removeItem('pendingActivityLog');
        } catch (e) {
          console.error('Error parsing prefilled data:', e);
        }
      }

      // If this is a challenge completion, handle the additional logic
      let isChallenge = false;
      let challengeDetails = null;
      if (challengeCompletionData) {
        try {
          challengeDetails = JSON.parse(challengeCompletionData);
          activityData.category = 'challenge';
          isChallenge = true;
        } catch (e) {
          console.error('Error parsing challenge completion data:', e);
        }
      }

      // Insert the activity (without community_id/challenge_id as they don't exist in schema)
      const { data: insertedActivity, error } = await supabase.from('activities').insert(activityData).select().single();

      if (error) throw error;

      // Handle community joining through activity (only if URL params present)
      if (communityId && autoJoin) {
        const { error: joinError } = await supabase
          .from('community_members')
          .insert([
            {
              community_id: communityId,
              user_id: userId,
              joined_through_activity: true,
              activity_id: insertedActivity.id,
              status: 'approved'
            }
          ]);

        if (joinError && joinError.code !== '23505') { // Ignore duplicate key error
          console.error('Error joining community:', joinError);
        }
      }

      // Handle challenge completion through activity (only if URL params present)
      if (challengeId && autoJoin) {
        const { error: challengeError } = await supabase
          .from('challenge_participants')
          .upsert([
            {
              challenge_id: challengeId,
              user_id: userId,
              completed: true,
              completed_at: new Date().toISOString(),
              completion_activity_id: insertedActivity.id
            }
          ]);

        if (challengeError) {
          console.error('Error completing challenge:', challengeError);
        }
      }

      // Handle challenge completion if this is from challenge verification
      if (isChallenge && challengeDetails) {
        try {
          // Import the challenge completion logic
          const { supabase } = await import('@/integrations/supabase/client');
          
          // Update challenge participant status
          const isDailyChallenge = challengeDetails.challengeId?.includes?.("daily") || false;
          
          if (isDailyChallenge) {
            const today = new Date().toISOString().split('T')[0];
            const { data: currentData } = await supabase
              .from("challenge_participants")
              .select("daily_completions, last_completed_date")
              .eq("id", challengeDetails.participantId)
              .single();
              
            const dailyCompletions = (currentData?.daily_completions as string[]) || [];
            const newCompletions = [...dailyCompletions, today];
            
            await supabase
              .from("challenge_participants")
              .update({ 
                daily_completions: newCompletions,
                last_completed_date: today,
                is_completed: newCompletions.length >= 5,
                completed_at: newCompletions.length >= 5 ? new Date().toISOString() : null
              })
              .eq("id", challengeDetails.participantId);
          } else {
            await supabase.from("challenge_participants").update({
              is_completed: true,
              completed_at: new Date().toISOString(),
            }).eq("id", challengeDetails.participantId);
          }

          // Update user kelp points (you'll need to get challenge reward info)
          // For now, assume a default reward
          const challengeReward = 50; // This should come from the challenge data
          const { data: profile } = await supabase
            .from("profiles")
            .select("kelp_points")
            .eq("id", userId)
            .single();
          
          if (profile) {
            const currentPoints = Number(profile.kelp_points ?? 0);
            await supabase.from("profiles").update({
              kelp_points: currentPoints + challengeReward,
            }).eq("id", userId);
          }

          // Clear challenge completion data
          localStorage.removeItem('challengeCompletionData');
          
          // Invalidate additional queries for challenge completion
          await queryClient.invalidateQueries({ queryKey: ["user-challenges", userId] });
          await queryClient.invalidateQueries({ queryKey: ["global-challenges"] });
          await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
          
        } catch (challengeError) {
          console.error('Error completing challenge:', challengeError);
          // Don't fail the entire submission if challenge completion fails
        }
      }

      // Invalidate activities query to refresh feed
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      
      toast.success(
        isChallenge 
          ? 'Challenge completed and activity shared!' 
          : communityId || challengeId 
            ? 'Activity logged and linked successfully!' 
            : 'Activity logged successfully!'
      );
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Carbon Impact</Label>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Input
                  type="number"
                  step="0.1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" variant="outline" onClick={handleEditSave}>
                  <Check className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Input
                  value={`${analysis.carbon_footprint_kg.toFixed(1)} kg CO₂e`}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(true);
                    setEditValue(analysis.carbon_footprint_kg.toString());
                  }}
                  disabled={isSubmitting}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isGreen ? (
              <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                <Info className="w-4 h-4 text-green-500" />
                This activity is recognized as <b>green</b>. 
                The system will always treat it as an emission offset (negative CO₂e).
                If you enter a positive value, it will be flipped to negative automatically.
              </span>
            ) : (
              <>You can edit this value if you think the estimate is incorrect.</>
            )}
          </p>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isSubmitting || isEditing}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              Posting Activity...
            </>
          ) : (
            'Post Activity'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivitySubmissionSection;

