// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to clean amount string
function cleanAmount(amount: string): number {
  // Remove currency symbols, spaces, and convert to standard format
  const cleaned = amount.replace(/[^0-9,\.]/g, '')
    .replace(/[,\.](?=.*[,\.])/g, '') // Keep only last decimal separator
    .replace(',', '.'); // Convert comma to dot for decimal
  return parseFloat(cleaned);
}

// Helper function to parse Indonesian date formats
function parseIndonesianDate(dateStr: string): Date {
  const months: { [key: string]: number } = {
    'januari': 0, 'jan': 0, 'february': 1, 'feb': 1, 'maret': 2, 'mar': 2,
    'april': 3, 'apr': 3, 'mei': 4, 'may': 4, 'juni': 5, 'jun': 5,
    'juli': 6, 'jul': 6, 'agustus': 7, 'aug': 7, 'september': 8, 'sep': 8,
    'oktober': 9, 'oct': 9, 'november': 10, 'nov': 10, 'desember': 11, 'dec': 11
  };

  try {
    // First try standard date parsing
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }

    // If standard parsing fails, try parsing Indonesian format
    const parts = dateStr.toLowerCase().split(/[\/\s,-]+/);
    let day, month, year;

    // Try to identify parts based on content
    for (const part of parts) {
      if (months.hasOwnProperty(part)) {
        month = months[part];
      } else if (part.length === 4 && !isNaN(Number(part))) {
        year = parseInt(part);
      } else if (!isNaN(Number(part)) && parseInt(part) <= 31) {
        day = parseInt(part);
      }
    }

    // If we have all parts, create date
    if (day && month !== undefined && year) {
      return new Date(year, month, day);
    }

    // If parsing fails, return current date
    return new Date();
  } catch {
    return new Date();
  }
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
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are a financial assistant specialized in analyzing Indonesian receipts and invoices.
                     Your task is to extract the following information:
                     1. Total amount (in IDR)
                     2. Merchant name or transaction description
                     3. Date of transaction
                     4. List of items if available (optional)
                     
                     Important notes:
                     - For amounts, look for terms like "TOTAL", "JUMLAH", "GRAND TOTAL"
                     - Dates might be in various formats (DD/MM/YYYY, DD-MM-YYYY, or written in Indonesian)
                     - Merchant names might be at the top or bottom of the receipt
                     
                     Return ONLY a JSON object with these exact keys:
                     {
                       "description": "merchant name or transaction description",
                       "amount": number (without currency symbol, commas as thousand separators),
                       "date": "YYYY-MM-DD",
                       "items": [{"name": "item name", "price": number}] (optional)
                     }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this receipt and extract the transaction details.' },
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
    
    // Parse and validate the AI response
    let extractedData;
    try {
      // Find JSON in the response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Clean and validate the data
        extractedData = {
          description: parsed.description?.trim() || 'Transaksi Baru',
          amount: typeof parsed.amount === 'string' ? 
            cleanAmount(parsed.amount) : 
            (typeof parsed.amount === 'number' ? parsed.amount : 0),
          date: parsed.date ? parseIndonesianDate(parsed.date) : new Date(),
          items: Array.isArray(parsed.items) ? parsed.items.map(item => ({
            name: item.name?.trim() || '',
            price: typeof item.price === 'string' ? 
              cleanAmount(item.price) : 
              (typeof item.price === 'number' ? item.price : 0)
          })) : undefined
        };

        // Additional validation
        if (extractedData.amount <= 0) {
          console.warn('Invalid amount detected:', parsed.amount);
          throw new Error('Invalid amount');
        }
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (err) {
      console.error('Error parsing AI response:', err);
      console.log('Raw AI response:', aiMessage);
      throw new Error('Failed to parse receipt data');
    }

    console.log('Receipt analysis result:', extractedData);
    
    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-receipt function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        description: 'Transaksi Baru',
        amount: 0,
        date: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 