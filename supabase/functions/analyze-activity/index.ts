import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log(`analyze-activity: ${req.method} request received`);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("analyze-activity: Handling CORS preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    console.log("analyze-activity: Processing request...");
    
    if (req.method !== "POST") {
      console.log("analyze-activity: Invalid method");
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const body = await req.json();
    const { imageUrl, caption } = body;
    console.log(`analyze-activity: imageUrl present: ${!!imageUrl}, caption: "${caption || 'none'}"`);

    if (!imageUrl) {
      console.log("analyze-activity: Missing imageUrl");
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    console.log(`analyze-activity: GEMINI_API_KEY present: ${!!GEMINI_API_KEY}, OPENAI_API_KEY present: ${!!OPENAI_API_KEY}`);

    const SYSTEM_PROMPT = `You are the Kelp Impact Scoring engine. Analyze an IRL adventure from an image and caption.

Return ONLY valid JSON with these fields:
{
  "carbon_footprint_kg": number,
  "explanation": string,
  "activity": string,
  "emoji": string,
  "dimensions": {
    "adventure_intensity": number,
    "social_connection": number,
    "environmental_impact": number,
    "economic_impact": number,
    "learning_growth": number
  },
  "authenticity_score": number,
  "social_proof_weight": 1.0,
  "impact_score": number
}

All numbers should be between 0-100 except carbon_footprint_kg (can be negative for savings) and authenticity_score (0-1).`;

    // Try Gemini first
    if (GEMINI_API_KEY) {
      console.log("analyze-activity: Using Gemini API");
      
      try {
        // Fetch image and convert to base64
        console.log("analyze-activity: Fetching image...");
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
        
        console.log(`analyze-activity: Image fetched, size: ${arrayBuffer.byteLength}, type: ${mimeType}`);

        const requestBody = {
          contents: [
            {
              parts: [
                { text: `${SYSTEM_PROMPT}\n\nAnalyze this image. Caption: ${caption || "(none)"}` },
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

        console.log("analyze-activity: Calling Gemini API...");
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
          console.error(`analyze-activity: Gemini API error: ${geminiResponse.status} - ${errorText}`);
          throw new Error(`Gemini API failed: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        console.log("analyze-activity: Gemini response received");
        
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.error("analyze-activity: No text in Gemini response");
          throw new Error("Invalid Gemini response");
        }

        console.log(`analyze-activity: Parsing Gemini response: ${text.substring(0, 100)}...`);
        const result = JSON.parse(text);

        // Convert string numbers to actual numbers
        if (typeof result.carbon_footprint_kg === "string") {
          result.carbon_footprint_kg = parseFloat(result.carbon_footprint_kg);
        }

        // Validate required fields
        if (!result.activity || !result.explanation || !result.emoji || typeof result.carbon_footprint_kg !== "number") {
          console.error("analyze-activity: Invalid result structure");
          throw new Error("Invalid analysis result");
        }

        console.log("analyze-activity: Success with Gemini");
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      } catch (error) {
        console.error("analyze-activity: Gemini error:", error.message);
        // Continue to OpenAI fallback
      }
    }

    // Fallback to OpenAI
    if (OPENAI_API_KEY) {
      console.log("analyze-activity: Using OpenAI API as fallback");
      
      try {
        const payload = {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: `Analyze this image. Caption: ${caption || "(none)"}` },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        };

        console.log("analyze-activity: Calling OpenAI API...");
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
          console.error(`analyze-activity: OpenAI error: ${response.status} - ${errorText}`);
          throw new Error(`OpenAI API failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        
        if (!content) {
          console.error("analyze-activity: No content in OpenAI response");
          throw new Error("Invalid OpenAI response");
        }

        console.log(`analyze-activity: Parsing OpenAI response: ${content.substring(0, 100)}...`);
        const result = JSON.parse(content);

        // Convert string numbers to actual numbers
        if (typeof result.carbon_footprint_kg === "string") {
          result.carbon_footprint_kg = parseFloat(result.carbon_footprint_kg);
        }

        // Validate required fields
        if (!result.activity || !result.explanation || !result.emoji || typeof result.carbon_footprint_kg !== "number") {
          console.error("analyze-activity: Invalid result structure");
          throw new Error("Invalid analysis result");
        }

        console.log("analyze-activity: Success with OpenAI");
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      } catch (error) {
        console.error("analyze-activity: OpenAI error:", error.message);
        throw error;
      }
    }

    // No API keys available
    console.error("analyze-activity: No API keys configured");
    return new Response(
      JSON.stringify({ error: "No AI provider configured. Please set GEMINI_API_KEY or OPENAI_API_KEY." }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );

  } catch (error: any) {
    console.error("analyze-activity: Fatal error:", error.message || error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});