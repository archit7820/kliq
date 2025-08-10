import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

const SYSTEM_PROMPT = `You are the Kelp Impact Scoring engine. Analyze an IRL adventure from an image (primary) and caption (secondary) and output a multi-dimensional impact assessment.

Mission: "Every real-life adventure deserves a meaningful impact score that encourages authentic living while naturally promoting positive change."

Scoring principles:
1) Real-Life First: digital-only actions score 0.
2) Effort Amplification: higher effort/challenge => higher scores.
3) Positive Impact Bonus: planet/community-positive activities get multipliers.
4) Social Proof Weight: leave as 1.0; clients will update post engagement.
5) Authenticity Filter: detect staged/fake content and reduce scores accordingly.
6) Progressive Difficulty: harder activities can unlock higher scores.

Return ONLY valid JSON with fields:
{
  "carbon_footprint_kg": number,                 // negative = savings, 0 = neutral, positive = emissions
  "explanation": string,                         // concise, youth-friendly summary
  "activity": string,                            // short title of the adventure
  "emoji": string,                               // matching emoji
  "dimensions": {
    "adventure_intensity": number,               // 0-100
    "social_connection": number,                 // 0-100
    "environmental_impact": number,              // 0-100 (higher is better overall impact; account for negatives/positives)
    "economic_impact": number,                   // 0-100
    "learning_growth": number                    // 0-100
  },
  "authenticity_score": number,                  // 0-1
  "social_proof_weight": number,                 // default 1.0 now
  "impact_score": number                         // 0-100 final weighted score using weights: A 25%, B 20%, C 20%, D 15%, E 10%; apply authenticity_score multiplier
}

Computation notes:
- If the image shows screens/indoor desk-only setup, set all scores to low and impact_score ≈ 0.
- Adventure Intensity scales with physical effort, time commitment, and risk/courage.
- Social Connection looks for interaction with people/community, inclusivity.
- Environmental Impact rewards low-carbon, reuse/repair, nature-positive actions. Penalize high-carbon unless mitigated.
- Economic Impact favors support of local/ethical choices and skill/resource sharing.
- Learning & Growth for new skills and cultural knowledge.
- Ensure numbers are valid and within ranges.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, caption } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prefer OpenAI vision if available; otherwise fallback to Gemini if configured
    if (OPENAI_API_KEY) {
      console.log("analyze-activity: Using OpenAI Vision (gpt-4o-mini)");
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this IRL adventure. Caption: ${caption || "(none)"}. Return JSON only.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      } as const;

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.text();
        console.error("OpenAI error:", err);
        return new Response(JSON.stringify({ error: "OpenAI analysis failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        return new Response(JSON.stringify({ error: "Invalid OpenAI response" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      let result: any;
      try {
        result = typeof content === "string" ? JSON.parse(content) : content;
      } catch (e) {
        console.error("Failed to parse OpenAI JSON:", content);
        return new Response(JSON.stringify({ error: "Invalid analysis result format" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (typeof result.carbon_footprint_kg === "string") {
        result.carbon_footprint_kg = parseFloat(result.carbon_footprint_kg);
      }

      // Basic validation for essential fields; allow extra fields for new scoring
      if (
        !result ||
        typeof result.carbon_footprint_kg !== "number" ||
        Number.isNaN(result.carbon_footprint_kg) ||
        !result.explanation ||
        !result.activity ||
        !result.emoji
      ) {
        return new Response(JSON.stringify({ error: "Incomplete analysis result" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fallback to Gemini if OpenAI key not set but Google key is
    if (GOOGLE_API_KEY) {
      console.log("analyze-activity: Falling back to Gemini");
      // We can pass image URL directly with Gemini 1.5 using a URI part, but we'll keep the previous working approach (fetch + inline data)
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch image" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const buf = await imageResp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunk = 8192;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.slice(i, i + chunk));
      }
      const b64 = btoa(binary);
      const mime = imageResp.headers.get("content-type") || "image/jpeg";

      const geminiBody = {
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\nAnalyze the IRL adventure in the image. Caption: "${caption || "No caption"}"` },
              { inline_data: { mime_type: mime, data: b64 } },
            ],
          },
        ],
        generation_config: { response_mime_type: "application/json" },
      };

      const gemResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
        }
      );

      if (!gemResp.ok) {
        const err = await gemResp.text();
        console.error("Gemini error:", err);
        return new Response(JSON.stringify({ error: "Analysis service unavailable" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const gemData = await gemResp.json();
      const text = gemData?.candidates?.[0]?.content?.parts?.[0]?.text;
      let result: any;
      try {
        result = typeof text === "string" ? JSON.parse(text) : text;
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid analysis result format" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (typeof result.carbon_footprint_kg === "string") {
        result.carbon_footprint_kg = parseFloat(result.carbon_footprint_kg);
      }

      if (
        !result ||
        typeof result.carbon_footprint_kg !== "number" ||
        Number.isNaN(result.carbon_footprint_kg) ||
        !result.explanation ||
        !result.activity ||
        !result.emoji
      ) {
        return new Response(JSON.stringify({ error: "Incomplete analysis result" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // No model available
    return new Response(
      JSON.stringify({ error: "No AI provider configured. Set OPENAI_API_KEY or GOOGLE_API_KEY in Supabase secrets." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  } catch (err: any) {
    console.error("analyze-activity error:", err?.message || err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
