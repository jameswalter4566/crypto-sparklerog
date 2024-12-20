import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coinData, userMessage } = await req.json();
    console.log("Analyzing coin data:", coinData);
    console.log("User message:", userMessage);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a cryptocurrency security analyst. Analyze the provided coin data and user's voice input to assess the rug pull risk. 
            Return ONLY a JSON object with these exact fields:
            {
              "devAnalysis": "Analysis of developer holdings",
              "launchAnalysis": "Analysis of launch history",
              "socialMediaStatus": "Analysis of social media presence",
              "rugScore": number between 0-100 indicating risk
            }`
          },
          {
            role: 'user',
            content: `Please analyze this cryptocurrency:
            Dev Holdings: ${coinData.devHoldings}
            Launch History: ${coinData.launchHistory}
            Social Media: ${coinData.socialMedia}
            User's Question: ${userMessage}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await openAIResponse.json();
    console.log("OpenAI raw response:", data);

    // Extract the content from the response and parse it as JSON
    const analysisText = data.choices[0].message.content.trim();
    console.log("Analysis text before parsing:", analysisText);
    
    const analysis = JSON.parse(analysisText);
    console.log("Parsed analysis:", analysis);

    // Validate the required fields
    if (!analysis.devAnalysis || !analysis.launchAnalysis || 
        !analysis.socialMediaStatus || typeof analysis.rugScore !== 'number') {
      throw new Error('Invalid analysis format returned from OpenAI');
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-rug function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});