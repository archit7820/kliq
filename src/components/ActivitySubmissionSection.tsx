
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Edit3, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivityAnalysis } from '@/pages/LogActivityPage';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(analysis.carbon_footprint_kg.toString());

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
      const { error } = await supabase.from('activities').insert({
        user_id: userId,
        activity: analysis.activity,
        carbon_footprint_kg: analysis.carbon_footprint_kg,
        explanation: analysis.explanation,
        emoji: analysis.emoji,
        image_url: imageUrl,
        caption: caption || null
      });

      if (error) {
        throw error;
      }

      toast.success('Activity logged successfully!');
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
            You can edit this value if you think the estimate is incorrect
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
