
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
    // Free exchange rate API
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify({ rates: data.rates }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback data in case of error
    const fallbackRates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.82,
      IDR: 15750,
      SGD: 1.34,
      MYR: 4.73,
      CNY: 7.24
    };
    
    return new Response(JSON.stringify({ 
      rates: fallbackRates,
      error: error.message,
      source: 'fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
