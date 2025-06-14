
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

// Helper function to convert ArrayBuffer to base64 without stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192 // Process in chunks to avoid stack overflow
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  
  return btoa(binary)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    const { imageUrl, caption } = requestBody

    console.log('Received request with imageUrl:', imageUrl ? 'present' : 'missing')

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set')
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 1. Fetch image and convert to base64
    console.log('Fetching image from URL...')
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image. Status: ${imageResponse.status}`)
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer()
    console.log('Image size:', imageArrayBuffer.byteLength, 'bytes')
    
    // Use safe base64 conversion
    const imageBase64 = arrayBufferToBase64(imageArrayBuffer)
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

    console.log('Image processed, calling Gemini API...')

    // 2. Prepare request for Gemini API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`

    const geminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nAnalyze the activity in the image. The user-provided caption is: "${caption || 'No caption provided.'}"`
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
      body: JSON.stringify(geminiRequestBody),
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API Error:', errorText)
      return new Response(JSON.stringify({ error: 'Analysis service unavailable' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    // 4. Parse the response safely
    if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', JSON.stringify(geminiData))
      return new Response(JSON.stringify({ error: 'Invalid response from analysis service' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const responseText = geminiData.candidates[0].content.parts[0].text
    let analysisResult

    try {
      // Check if responseText is already an object or needs parsing
      if (typeof responseText === 'string') {
        analysisResult = JSON.parse(responseText)
      } else {
        analysisResult = responseText
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', responseText)
      return new Response(JSON.stringify({ error: 'Invalid analysis result format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Validate the response structure
    if (!analysisResult || 
        typeof analysisResult.carbon_footprint_kg !== 'number' ||
        !analysisResult.explanation ||
        !analysisResult.activity ||
        !analysisResult.emoji) {
      console.error('Invalid analysis result structure:', analysisResult)
      return new Response(JSON.stringify({ error: 'Incomplete analysis result' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('Analysis completed successfully')
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in analyze-activity function:', error.message)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
