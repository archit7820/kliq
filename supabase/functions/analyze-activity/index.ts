import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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
  console.log(`Method: ${req.method}`);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const { imageUrl, caption } = await req.json();
    console.log(`Request received - imageUrl: ${imageUrl ? 'present' : 'missing'}, caption: ${caption || 'none'}`);

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Use Gemini API directly with fetch (more reliable for edge functions)
    if (GEMINI_API_KEY) {
      console.log("Using Gemini Vision API");
      
      try {
        // Fetch and encode the image
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) {
          console.error(`Failed to fetch image: ${imageResp.status} ${imageResp.statusText}`);
          return new Response(JSON.stringify({ error: "Failed to fetch image" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const arrayBuffer = await imageResp.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

        const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this IRL adventure. Caption: ${caption || "(none)"}. Return JSON only.`;
        
        const requestBody = {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        };

        console.log("Making request to Gemini API...");
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
          return new Response(JSON.stringify({ 
            error: "Gemini analysis failed", 
            details: errorText.substring(0, 200) 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        const geminiData = await geminiResponse.json();
        console.log("Gemini response received");
        
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.error("No text in Gemini response", JSON.stringify(geminiData));
          return new Response(JSON.stringify({ error: "Invalid Gemini response format" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        let result: any;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse Gemini JSON:", text);
          return new Response(JSON.stringify({ 
            error: "Invalid analysis result format",
            raw_response: text.substring(0, 200)
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        // Ensure carbon_footprint_kg is a number
        if (typeof result.carbon_footprint_kg === "string") {
          result.carbon_footprint_kg = parseFloat(result.carbon_footprint_kg);
        }

        // Basic validation for essential fields
        if (
          !result ||
          typeof result.carbon_footprint_kg !== "number" ||
          Number.isNaN(result.carbon_footprint_kg) ||
          !result.explanation ||
          !result.activity ||
          !result.emoji
        ) {
          console.error("Incomplete analysis result:", result);
          return new Response(JSON.stringify({ 
            error: "Incomplete analysis result",
            result: result
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        console.log("Analysis successful");
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      } catch (error) {
        console.error("Gemini processing error:", error);
        return new Response(JSON.stringify({ 
          error: "Gemini analysis failed", 
          details: error.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // Fallback to OpenAI if Gemini not available
    if (OPENAI_API_KEY) {
      console.log("Falling back to OpenAI Vision");
      
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
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI error:", errorText);
        return new Response(JSON.stringify({ error: "OpenAI analysis failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        return new Response(JSON.stringify({ error: "Invalid OpenAI response" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      let result: any;
      try {
        result = JSON.parse(content);
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

      // Basic validation for essential fields
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

    // No API key available
    console.error("No API keys configured");
    return new Response(
      JSON.stringify({ error: "No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in Supabase secrets." }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );

  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});