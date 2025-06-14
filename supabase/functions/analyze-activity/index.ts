
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Analyze the image and the accompanying caption to identify the primary activity. Estimate its carbon footprint in kg CO2e.
Provide context-aware analysis. For example, if the caption says "cycling to work instead of driving", calculate the carbon saved and represent it as a negative value.
Return a JSON object with:
- "activity" (string): A descriptive name for the activity (e.g., "Eating a steak dinner", "Cycling to work").
- "carbon_footprint_kg" (number): The estimated carbon footprint. A positive number indicates emissions, a negative number indicates an offset/saving.
- "explanation" (string): A brief, one-sentence explanation for the estimate, considering the caption.
- "emoji" (string): A single emoji that represents the activity.

If the activity is unclear or has a negligible carbon footprint (like drinking water), set carbon_footprint_kg to 0.
Your response MUST be a valid JSON object.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image_b64, caption } = await req.json();

    if (!openAIApiKey) {
      throw new Error("Missing OPENAI_API_KEY secret.");
    }
    if (!image_b64) {
      throw new Error("Missing image_b64 in request body.");
    }

    const userContent: any[] = [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${image_b64}`,
          detail: 'low',
        },
      },
    ];

    if (caption) {
      userContent.push({
        type: 'text',
        text: `User caption for additional context: "${caption}"`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI API error:", errorBody);
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const resultJson = JSON.parse(resultText);

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in analyze-activity function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
