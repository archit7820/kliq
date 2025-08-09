import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

const SYSTEM_PROMPT = `You are an expert in carbon footprint analysis. Your task is to analyze an activity and estimate its carbon footprint in kg of CO2 equivalent.
Analyze the user's activity based on the provided image and caption.
- PRIORITIZE the image content; use caption as secondary context
- If unclear, state that the image was unclear and rely on caption
Return ONLY a valid JSON object with exactly these fields:
{
  "carbon_footprint_kg": number,
  "explanation": string,
  "activity": string,
  "emoji": string
}
If the activity represents a carbon reduction (e.g. biking instead of driving), use a NEGATIVE number. Neutral = 0.`;

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
              { type: "text", text: `Analyze this activity. Caption: ${caption || "(none)"}. Return JSON only.` },
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
              { text: `${SYSTEM_PROMPT}\n\nAnalyze the activity in the image. Caption: "${caption || "No caption"}"` },
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
