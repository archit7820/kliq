
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import uploadChallengeSnap from "@/lib/uploadChallengeSnap";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import ActivityChoiceModal from "@/components/ActivityChoiceModal";

type Challenge = {
  id: string;
  title: string;
  description?: string;
  reward: number;
};
interface ChallengeVerificationDialogProps {
  challenge: Challenge;
  participantId: string;
  onFinish?: () => void;
}

const ChallengeVerificationDialog: React.FC<ChallengeVerificationDialogProps> = ({
  challenge,
  participantId,
  onFinish
}) => {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [offset, setOffset] = useState(""); // <--- new for co2e offset
  const [submitting, setSubmitting] = useState(false);
  const [showActivityChoice, setShowActivityChoice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    console.log('Closing challenge verification dialog');
    setOpen(false);
    setCaption("");
    setFile(null);
    setOffset("");
  };

  // Complete challenge quietly (without posting to explore feed)
  const completeChallengeQuietly = async () => {
    if (!user) return;

    try {
      await updateChallengeParticipant();
      await updateUserPoints();
      
      // Clean up and close
      await queryClient.invalidateQueries({ queryKey: ["user-challenges", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["global-challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      
      if (onFinish) onFinish();
      toast.success("Challenge completed! Rewarded " + challenge.reward + " Kelp Points.");
    } catch (err: any) {
      toast.error("Failed to complete challenge", { description: err?.message });
      console.error("Error completing challenge: ", err);
    }
  };

  // Update challenge participant status
  const updateChallengeParticipant = async () => {
    const isDailyChallenge = challenge.title.toLowerCase().includes("daily");
    
    if (isDailyChallenge) {
      const today = new Date().toISOString().split('T')[0];
      const { data: currentData } = await supabase
        .from("challenge_participants")
        .select("daily_completions, last_completed_date")
        .eq("id", participantId)
        .single();
        
      const dailyCompletions = (currentData?.daily_completions as string[]) || [];
      const newCompletions = [...dailyCompletions, today];
      
      const { error: updateErr } = await supabase
        .from("challenge_participants")
        .update({ 
          daily_completions: newCompletions,
          last_completed_date: today,
          is_completed: newCompletions.length >= 5,
          completed_at: newCompletions.length >= 5 ? new Date().toISOString() : null
        })
        .eq("id", participantId);
      if (updateErr) throw updateErr;
    } else {
      const { error: updateErr } = await supabase.from("challenge_participants").update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      }).eq("id", participantId);
      if (updateErr) throw updateErr;
    }
  };

  // Update user kelp points
  const updateUserPoints = async () => {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("kelp_points")
      .eq("id", user!.id)
      .single();
    if (profileErr) throw profileErr;
    
    const currentPoints = Number(profile?.kelp_points ?? 0);
    const { error: pointsErr } = await supabase.from("profiles").update({
      kelp_points: currentPoints + challenge.reward,
    }).eq("id", user!.id);
    if (pointsErr) throw pointsErr;
  };

  // Main submit handler - now shows choice modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!file) {
      toast.error("Please upload a photo as verification.");
      if (fileInputRef.current) fileInputRef.current.focus();
      return;
    }
    
    setSubmitting(true);
    try {
      // Upload image first
      const imageUrl = await uploadChallengeSnap(file, user.id, challenge.id);
      
      // Store data for potential activity posting
      const challengeData = {
        imageUrl,
        caption,
        offset: offset ? parseFloat(offset) : 0,
        challengeId: challenge.id,
        participantId
      };
      localStorage.setItem('challengeCompletionData', JSON.stringify(challengeData));
      
      setSubmitting(false);
      setOpen(false);
      setShowActivityChoice(true);
    } catch (err: any) {
      setSubmitting(false);
      toast.error("Failed to upload image", { description: err?.message });
      console.error("Error uploading image: ", err);
    }
  };

  // Handle posting to activity feed when user chooses to share
  const handlePostToFeed = async () => {
    try {
      const storedData = localStorage.getItem('challengeCompletionData');
      if (!storedData || !user) return;
      
      const challengeData = JSON.parse(storedData);
      
      // Post to activities feed
      const emission = challengeData.offset ? -Math.abs(challengeData.offset) : 0;
      const explanation = challengeData.offset
        ? `Verified by photo. ${challengeData.offset ? `(Offset: ${-Math.abs(challengeData.offset)} CO₂e kg)` : ""}`
        : "Verified by photo.";

      const { error: activityErr } = await supabase.from("activities").insert({
        user_id: user.id,
        activity: "Completed challenge: " + challenge.title,
        caption: challengeData.caption,
        category: "challenge",
        image_url: challengeData.imageUrl,
        explanation,
        carbon_footprint_kg: emission,
        emoji: "🏆",
      });
      if (activityErr) throw activityErr;
      
      // Complete the challenge
      await completeChallengeQuietly();
      
      // Clean up
      localStorage.removeItem('challengeCompletionData');
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch (err: any) {
      toast.error("Failed to post activity", { description: err?.message });
      console.error("Error posting activity: ", err);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white px-4 font-semibold rounded-xl"
          >
            Mark as Completed
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Complete: {challenge.title}</DialogTitle>
                <DialogDescription>
                  Upload a photo as proof of completion. Optionally, add a comment.<br />
                  <span className="text-green-800 font-medium">If your challenge removes CO₂e (offsets), you can enter your estimated offset!</span>
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full hover:bg-muted/30 touch-manipulation active:scale-95"
                onClick={handleClose}
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="snap" className="text-sm">Photo Verification <span className="text-red-500">*</span></label>
            <Input
              id="snap"
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              ref={fileInputRef}
              disabled={submitting}
              required
            />
            <label htmlFor="caption" className="text-sm">Comment or Details</label>
            <Input
              id="caption"
              maxLength={80}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="(optional)"
              disabled={submitting}
            />
            <label htmlFor="offset" className="text-sm">
              Offset (CO₂e kg, optional) <span className="text-xs text-gray-500">(Enter negative value for climate positive challenges)</span>
            </label>
            <Input
              id="offset"
              type="number"
              min="0"
              step="0.01"
              value={offset}
              onChange={e => setOffset(e.target.value)}
              placeholder="E.g. 2.5"
              disabled={submitting}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button type="button" variant="ghost" disabled={submitting} onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activity Choice Modal */}
      <ActivityChoiceModal
        isOpen={showActivityChoice}
        onClose={() => setShowActivityChoice(false)}
        actionType="challenge"
        actionTitle={challenge.title}
        actionData={{
          challengeId: challenge.id,
          description: challenge.description,
          category: "challenge",
          prefilledActivity: `Completed challenge: ${challenge.title}`,
          prefilledCaption: `Just completed "${challenge.title}"! 🏆`
        }}
        onJustComplete={async () => {
          await completeChallengeQuietly();
          localStorage.removeItem('challengeCompletionData');
          setShowActivityChoice(false);
        }}
      />
    </>
  );
};

export default ChallengeVerificationDialog;
