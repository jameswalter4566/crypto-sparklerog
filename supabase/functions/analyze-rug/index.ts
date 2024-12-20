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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a cryptocurrency security analyst. Analyze the provided coin data and user's voice input to assess the rug pull risk. 
            Format your response as a JSON object with these fields:
            - devAnalysis: Analysis of developer holdings
            - launchAnalysis: Analysis of launch history
            - socialMediaStatus: Analysis of social media presence
            - rugScore: A number between 0-100 indicating risk (higher = riskier)`
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
      }),
    });

    const data = await openAIResponse.json();
    console.log("OpenAI response:", data);

    // Parse the response text as JSON
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-rug function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});