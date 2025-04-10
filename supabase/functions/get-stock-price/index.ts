
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
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Stock symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Note: In a production app, you'd use a real API with an API key
    // For demo purposes, we're using mock data based on the symbol
    
    // Mock stock data for Indonesian stocks
    const mockStocks = {
      'BBCA.JK': { price: 9850, change: 0.75 },
      'BBRI.JK': { price: 5200, change: -0.25 },
      'BMRI.JK': { price: 6100, change: 0.50 },
      'TLKM.JK': { price: 3900, change: 0.10 },
      'ASII.JK': { price: 5750, change: -0.35 },
      'UNVR.JK': { price: 4500, change: 0.20 },
      'HMSP.JK': { price: 1550, change: -0.10 },
      'ICBP.JK': { price: 8750, change: 0.30 },
      'INDF.JK': { price: 6450, change: -0.15 },
      'GGRM.JK': { price: 24500, change: 0.40 },
    };
    
    // Get stock data from mock or generate random if not found
    const stockData = mockStocks[symbol] || {
      price: Math.round(5000 + Math.random() * 5000),
      change: (Math.random() * 2 - 1).toFixed(2)
    };
    
    return new Response(JSON.stringify(stockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching stock price:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      price: null,
      change: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
