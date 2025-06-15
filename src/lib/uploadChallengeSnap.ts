
import { supabase } from "@/integrations/supabase/client";
// Helper to upload a snap and return public URL for feed use
export default async function uploadChallengeSnap(file: File, userId: string, challengeId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const snapFilename = `${userId}-${challengeId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("challenge_verification_snaps")
    .upload(snapFilename, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("challenge_verification_snaps")
    .getPublicUrl(snapFilename);

  if (!urlData?.publicUrl) throw new Error("Could not get public URL for uploaded snap.");
  return urlData.publicUrl;
}
