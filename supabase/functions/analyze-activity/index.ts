
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

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

    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables.')
    }

    // 1. Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`)
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)))
    const mimeType = imageResponse.headers.get('content-type') ?? 'image/jpeg'

    // 2. Prepare request for Gemini API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nAnalyze the activity in the image. The user-provided caption is: "${
                caption || 'No caption provided.'
              }"`,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generation_config: {
        response_mime_type: 'application/json',
      },
    }

    // 3. Call Gemini API
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text()
      console.error('Gemini API Error:', errorBody)
      throw new Error(`Gemini API request failed with status ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()

    // 4. Parse the response
    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts[0]?.text) {
      console.error('Invalid response structure from Gemini:', geminiData)
      throw new Error('Received an invalid response from the analysis service.')
    }

    const responseText = geminiData.candidates[0].content.parts[0].text
    const parsedResponse = JSON.parse(responseText)

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
