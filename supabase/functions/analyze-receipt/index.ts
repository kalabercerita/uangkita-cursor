
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing image URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI Vision API to analyze the receipt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a financial assistant that can extract information from receipts.
                      Analyze the receipt image and extract:
                      1. The total amount
                      2. The merchant or description of the transaction
                      3. The date of transaction
                      
                      Return the data in JSON format with keys: description, amount (as number without currency symbol), date (in ISO format).`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this receipt and extract the transaction details.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to analyze receipt with OpenAI');
    }

    const result = await response.json();
    const aiMessage = result.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let extractedData;
    try {
      // Find JSON in the response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (err) {
      console.error('Error parsing AI response:', err);
      console.log('Raw AI response:', aiMessage);
      
      // Fallback to a simple object
      extractedData = {
        description: 'Transaksi Baru',
        amount: 0,
        date: new Date().toISOString()
      };
    }

    console.log('Receipt analysis result:', extractedData);
    
    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-receipt function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
