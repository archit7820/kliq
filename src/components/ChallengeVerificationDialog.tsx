
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    console.log('Closing challenge verification dialog');
    setOpen(false);
    setCaption("");
    setFile(null);
    setOffset("");
  };

  // Main submit handler
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
      // 1. Upload image to storage
      const imageUrl = await uploadChallengeSnap(file, user.id, challenge.id);

      // 2. Insert into activities feed as a "challenge-completion" activity
      const emission = offset
        ? -Math.abs(Number(offset))
        : 0;
      const explanation = offset
        ? `Verified by photo. ${Number(offset) ? `(Offset: ${-Math.abs(Number(offset))} CO₂e kg)` : ""}`
        : "Verified by photo.";

      const { error: activityErr } = await supabase.from("activities").insert({
        user_id: user.id,
        activity: "Completed challenge: " + challenge.title,
        caption,
        category: "challenge",
        image_url: imageUrl,
        explanation,
        carbon_footprint_kg: emission,
        emoji: "🏆",
      });
      if (activityErr) throw activityErr;

      // 3. Update participant row as completed
      const { error: updateErr } = await supabase.from("challenge_participants").update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      }).eq("id", participantId);
      if (updateErr) throw updateErr;

      // 4. Reward user kelp points
      // Fetch current kelp_points
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("kelp_points")
        .eq("id", user.id)
        .single();
      if (profileErr) {
        throw profileErr;
      }
      const currentPoints = Number(profile?.kelp_points ?? 0);
      const { error: pointsErr } = await supabase.from("profiles").update({
        kelp_points: currentPoints + challenge.reward,
      }).eq("id", user.id);
      if (pointsErr) throw pointsErr;

      // Invalidate all relevant queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["global-challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      
      toast.success("Challenge completed! Rewarded " + challenge.reward + " Kelp Points.");
      handleClose();
      if (onFinish) onFinish();
      
      // Reset form state
      setCaption("");
      setFile(null);  
      setOffset("");
    } catch (err: any) {
      toast.error("Failed to verify challenge", { description: err?.message });
      console.error("Error verifying challenge: ", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
  );
};

export default ChallengeVerificationDialog;
