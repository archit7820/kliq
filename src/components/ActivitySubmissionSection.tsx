
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

      // Insert the activity
      const { data: activityData, error } = await supabase.from('activities').insert({
        user_id: userId,
        activity: analysis.activity,
        carbon_footprint_kg: analysis.carbon_footprint_kg,
        explanation: analysis.explanation,
        emoji: analysis.emoji,
        image_url: imageUrl,
        caption: caption || null,
        category: 'general',
        community_id: communityId, // Link to community if joining through activity
        challenge_id: challengeId   // Link to challenge if completing through activity
      }).select().single();

      if (error) throw error;

      // Handle community joining through activity
      if (communityId && autoJoin) {
        const { error: joinError } = await supabase
          .from('community_members')
          .insert([
            {
              community_id: communityId,
              user_id: userId,
              joined_through_activity: true,
              activity_id: activityData.id,
              status: 'approved'
            }
          ]);

        if (joinError && joinError.code !== '23505') { // Ignore duplicate key error
          console.error('Error joining community:', joinError);
        }
      }

      // Handle challenge completion through activity
      if (challengeId && autoJoin) {
        const { error: challengeError } = await supabase
          .from('challenge_participants')
          .upsert([
            {
              challenge_id: challengeId,
              user_id: userId,
              completed: true,
              completed_at: new Date().toISOString(),
              completion_activity_id: activityData.id
            }
          ]);

        if (challengeError) {
          console.error('Error completing challenge:', challengeError);
        }
      }

      // Invalidate activities query to refresh feed
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      
      toast.success(
        communityId || challengeId 
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

