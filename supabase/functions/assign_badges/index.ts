
// Supabase Edge Function: assign_badges
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../types.ts"; // You may need to change the path here.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Grab Supabase credentials from env in function context
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get("Authorization")! }}});

  // Identify the user
  const { user_id } = await req.json().catch(() => ({}));
  if (!user_id) {
    return new Response(JSON.stringify({ error: "Missing user_id" }), { headers: corsHeaders, status: 400 });
  }

  // Badge seeds (only if table is empty)
  const badgeSeeds = [
    { name: "OG", description: "First 10,000 registered users!", is_og_badge: true, icon_url: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png", criteria: { og: true } },
    { name: "Eco Hero", description: "Earn 500+ kelp points", icon_url: "https://cdn-icons-png.flaticon.com/512/3774/3774293.png", criteria: { kelp_points: 500 } },
    { name: "CO₂e Saver", description: "Offset over 50kg CO₂e", icon_url: "https://cdn-icons-png.flaticon.com/512/3774/3774291.png", criteria: { co2e_offset: 50 } },
    { name: "Streak Master", description: "7 day streak", icon_url: "https://cdn-icons-png.flaticon.com/512/3774/3774295.png", criteria: { streak: 7 } },
    { name: "Challenge Champ", description: "Complete 3 team challenges", icon_url: "https://cdn-icons-png.flaticon.com/512/3774/3774298.png", criteria: { challenges_completed: 3 } },
  ];

  // Ensure badge seeds exist
  const { data: existingBadges } = await supabase.from("badges").select("*");
  if ((existingBadges?.length ?? 0) === 0) {
    for (const badge of badgeSeeds) {
      await supabase.from("badges").insert([
        { name: badge.name, description: badge.description, is_og_badge: badge.is_og_badge || false, icon_url: badge.icon_url, criteria: badge.criteria },
      ]);
    }
  }

  // Fetch user profile, kelp points, streak, etc.
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user_id).maybeSingle();
  if (!profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), { headers: corsHeaders, status: 404 });
  }

  // Count user registration index (for OG badge)
  const { data: allUsers } = await supabase.from("profiles").select("id,created_at").order("created_at", { ascending: true });
  const userIndex = allUsers?.findIndex((u) => u.id === user_id);

  // Gather achievements checks
  const kelp_points = Number(profile.kelp_points) || 0;
  const streak = Number(profile.streak_count) || 0;
  const co2e_offset = Number(profile.co2e_weekly_progress) || 0;

  // Example: Check completed challenges (custom logic, count of completed challenge_participants)
  const { count: completedChallenges } = await supabase
    .from("challenge_participants")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("is_completed", true);

  let earnedBadges: string[] = [];

  // Loop badges and assign if attained
  for (const badge of existingBadges || []) {
    let earned = false;
    if (badge.name === "OG" && userIndex > -1 && userIndex < 10000) {
      earned = true;
    }
    if (badge.criteria?.kelp_points && kelp_points >= badge.criteria.kelp_points) {
      earned = true;
    }
    if (badge.criteria?.co2e_offset && co2e_offset >= badge.criteria.co2e_offset) {
      earned = true;
    }
    if (badge.criteria?.streak && streak >= badge.criteria.streak) {
      earned = true;
    }
    if (badge.criteria?.challenges_completed && completedChallenges! >= badge.criteria.challenges_completed) {
      earned = true;
    }
    // If earned AND not yet assigned
    if (earned) {
      // Insert into user_badges if not already present
      const { data: hasIt } = await supabase.from("user_badges").select("id").eq("user_id", user_id).eq("badge_id", badge.id).maybeSingle();
      if (!hasIt) {
        await supabase.from("user_badges").insert([{ user_id, badge_id: badge.id }]);
        earnedBadges.push(badge.name);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, new: earnedBadges }), { headers: corsHeaders });
});
