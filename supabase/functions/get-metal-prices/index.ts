
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
    // Note: In a production app, you'd use a real API with an API key
    // For demo purposes, we're using a public API or fallback data
    
    // Get gold price (per Troy Ounce in USD)
    const goldPrice = 2000.50; // Fixed mock price
    
    // Get silver price (per Troy Ounce in USD)
    const silverPrice = 25.75; // Fixed mock price
    
    return new Response(JSON.stringify({
      gold: goldPrice,
      silver: silverPrice,
      unit: 'troy_ounce',
      currency: 'USD'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching metal prices:', error);
    
    // Return fallback data in case of error
    return new Response(JSON.stringify({
      gold: 2000.50,
      silver: 25.75,
      unit: 'troy_ounce',
      currency: 'USD',
      error: error.message,
      source: 'fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
