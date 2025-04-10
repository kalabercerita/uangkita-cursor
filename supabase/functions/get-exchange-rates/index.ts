
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
    // Try to fetch from a free exchange rate API
    let apiData = null;
    
    try {
      // Attempt to fetch from an API
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      
      if (response.ok) {
        const data = await response.json();
        apiData = data;
      }
    } catch (e) {
      console.error("Error fetching from API:", e);
    }
    
    // If API request succeeded, use the data
    if (apiData) {
      return new Response(JSON.stringify({ 
        rates: apiData.rates,
        source: 'api',
        last_updated: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // If API request failed, use updated hardcoded values based on current Wise rates
    // Updated with more accurate exchange rates (as of April 2025)
    const fallbackRates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.78,
      JPY: 151.5,
      IDR: 16250, // Updated IDR rate to match Wise
      SGD: 1.35,
      MYR: 4.73,
      CNY: 7.24,
      AUD: 1.52,
      CAD: 1.36,
      HKD: 7.82,
      THB: 35.85
    };
    
    return new Response(JSON.stringify({ 
      rates: fallbackRates,
      source: 'fallback',
      last_updated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback data in case of error with Wise approximations
    const fallbackRates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.78,
      JPY: 151.5,
      IDR: 16250, // Updated IDR rate
      SGD: 1.35,
      MYR: 4.73,
      CNY: 7.24,
      AUD: 1.52,
      CAD: 1.36
    };
    
    return new Response(JSON.stringify({ 
      rates: fallbackRates,
      error: error.message,
      source: 'error_fallback',
      last_updated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
