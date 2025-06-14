
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from 'https://deno.land/x/openai@v4.52.7/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const SYSTEM_PROMPT = `You are an expert in carbon footprint analysis. Your task is to analyze an activity and estimate its carbon footprint in kg of CO2 equivalent.
Analyze the user's activity based on the provided image and caption.
**You MUST prioritize the image as the primary source of information for the analysis.** Use the caption as secondary, supporting context to refine your analysis.
If the image and caption seem to conflict, rely on the image's content. If the image is unclear, too generic, or irrelevant to an activity, then you can rely on the caption, but you must state that the image was not clear.
Your response MUST be a valid JSON object with the exact following structure:
{
  "carbon_footprint_kg": number,
  "explanation": "A brief, one-sentence explanation of how you arrived at the calculation.",
  "activity": "A short, descriptive title for the activity (e.g., 'Driving a car').",
  "emoji": "A single emoji that represents the activity."
}
If the activity represents a carbon offset or a reduction in emissions (e.g., planting a tree, using a reusable cup instead of disposable), the 'carbon_footprint_kg' value should be a negative number. For neutral activities, use 0.
Be realistic and base your estimations on scientific data about carbon emissions. For example, a steak dinner is high, taking a flight is very high, riding a bike is 0 or slightly negative if it replaces a car trip.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, caption } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    const userContent = [
      {
        type: 'text',
        text: `Analyze the activity in the image. The user-provided caption is: "${caption || 'No caption provided.'}"`,
      },
      {
        type: 'image_url',
        image_url: {
          url: imageUrl,
        },
      },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          // deno-lint-ignore no-explicit-any
          content: userContent as any,
        },
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const responseText = response.choices[0].message.content
    
    if (!responseText) {
       throw new Error("Empty response from OpenAI")
    }

    // Attempt to parse the JSON, knowing it might be imperfect
    const cleanedResponseText = responseText.trim().replace(/```json/g, '').replace(/```/g, '');
    const parsedResponse = JSON.parse(cleanedResponseText);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in analyze-activity function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
