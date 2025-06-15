
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getActiveUsers() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/activities?select=user_id&created_at=gte.${since}`,
    { headers }
  );
  if (!res.ok) return [];
  const activities = await res.json();
  return Array.from(new Set(activities.map((a: any) => a.user_id)));
}

async function userHasInsightToday(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = today.toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/eco_insights?user_id=eq.${userId}&created_at=gte.${dateStr}`,
    { headers }
  );
  if (!res.ok) return true;
  const data = await res.json();
  return data.length > 0;
}

async function getUserRecentActivities(userId: string) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/activities?user_id=eq.${userId}&created_at=gte.${since}`,
    { headers }
  );
  if (!res.ok) return [];
  return await res.json();
}

async function insertInsight(userId: string, insight: string) {
  const body = [{ user_id: userId, insight }];
  await fetch(`${SUPABASE_URL}/rest/v1/eco_insights`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function generateEcoInsight(userId: string, activities: any[]) {
  const summary =
    activities.length === 0
      ? "No activities logged recently."
      : activities
          .map(
            (a: any) =>
              `${a.category || "General"}: ${a.description || ""} (${a.carbon_footprint_kg}kg CO₂e)`
          )
          .slice(0, 5)
          .join("; ");
  const prompt = `The user performed these eco-friendly activities recently:\n${summary}\nGive them an encouraging, friendly one-sentence eco tip or insight based on what they’ve done, for a dashboard.`;
  const messages = [
    {
      role: "system",
      content:
        "You are an expert on sustainability and climate action. You write short, friendly, actionable eco insights for everyday people based on their recent activities for a climate app dashboard.",
    },
    { role: "user", content: prompt },
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 60,
    }),
  });
  if (!res.ok) return "Keep up the climate action! 🌱";
  const json = await res.json();
  return (
    json?.choices?.[0]?.message?.content?.trim() ||
    "Keep up the climate action! 🌱"
  );
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const users = await getActiveUsers();
    let createdCount = 0;
    for (const userId of users) {
      if (!(await userHasInsightToday(userId))) {
        const acts = await getUserRecentActivities(userId);
        const insight = await generateEcoInsight(userId, acts);
        await insertInsight(userId, insight);
        createdCount++;
      }
    }
    return new Response(
      JSON.stringify({ ok: true, insightsCreated: createdCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
