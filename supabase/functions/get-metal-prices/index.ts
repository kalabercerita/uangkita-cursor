
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
    // Try to fetch from an API (for demo purposes only)
    let apiData = null;
    
    try {
      // This API requires API key in production
      // For demo purposes, we'll attempt a request but fallback to hardcoded values
      const response = await fetch("https://api.metals.live/v1/spot");
      if (response.ok) {
        const data = await response.json();
        apiData = data;
      }
    } catch (e) {
      console.error("Error fetching from API:", e);
    }
    
    // If API request failed, use updated hardcoded values
    if (!apiData) {
      // Updated with more accurate and realistic gold prices in IDR
      // Gold price per gram in IDR (~ Rp 1,846,000 per gram)
      const goldPricePerGram = 1846000;
      // Gold price per troy ounce (1 troy ounce = 31.1034768 grams)
      const goldPrice = goldPricePerGram * 31.1034768;
      
      // Silver price per gram in IDR (~ Rp 22,000 per gram)
      const silverPricePerGram = 22000;
      // Silver price per troy ounce
      const silverPrice = silverPricePerGram * 31.1034768;
      
      // USD to IDR exchange rate (~Rp 15,850 per USD)
      const usdToIdr = 15850;
      
      return new Response(JSON.stringify({
        gold: goldPrice,
        gold_per_gram: goldPricePerGram,
        silver: silverPrice,
        silver_per_gram: silverPricePerGram,
        usd_to_idr: usdToIdr,
        unit: 'troy_ounce',
        unit_gram: 'gram',
        currency: 'IDR',
        source: 'hardcoded',
        last_updated: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // If API request succeeded, use the data from the API
    const goldUSD = apiData.find(metal => metal.name === "Gold")?.price || 2325;
    const silverUSD = apiData.find(metal => metal.name === "Silver")?.price || 27;
    
    // USD to IDR exchange rate (~Rp 15,850 per USD)
    const usdToIdr = 15850;
    
    // Convert to IDR
    const goldPricePerOunce = goldUSD * usdToIdr;
    const goldPricePerGram = goldPricePerOunce / 31.1034768;
    
    const silverPricePerOunce = silverUSD * usdToIdr;
    const silverPricePerGram = silverPricePerOunce / 31.1034768;
    
    return new Response(JSON.stringify({
      gold: goldPricePerOunce,
      gold_per_gram: goldPricePerGram,
      silver: silverPricePerOunce,
      silver_per_gram: silverPricePerGram,
      usd_to_idr: usdToIdr,
      unit: 'troy_ounce',
      unit_gram: 'gram',
      currency: 'IDR',
      source: 'api',
      last_updated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching metal prices:', error);
    
    // Return fallback data in case of error with updated prices
    return new Response(JSON.stringify({
      gold: 57415100, // ~Rp 1,846,000 per gram * 31.1034768
      gold_per_gram: 1846000,
      silver: 684276, // ~Rp 22,000 per gram * 31.1034768
      silver_per_gram: 22000,
      usd_to_idr: 15850,
      unit: 'troy_ounce',
      unit_gram: 'gram',
      currency: 'IDR',
      error: error.message,
      source: 'fallback',
      last_updated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
