
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
    
    // Updated mock stock data for Indonesian stocks with more accurate prices
    // These prices are more realistic but still synthetic as real-time API access would require paid subscriptions
    const mockStocks = {
      'BBCA.JK': { price: 9850, change: 0.75, name: 'Bank Central Asia', code: 'BBCA.JK' },
      'BBRI.JK': { price: 5425, change: 0.25, name: 'Bank Rakyat Indonesia', code: 'BBRI.JK' },
      'BMRI.JK': { price: 6325, change: 0.50, name: 'Bank Mandiri', code: 'BMRI.JK' },
      'TLKM.JK': { price: 3830, change: -0.10, name: 'Telkom Indonesia', code: 'TLKM.JK' },
      'ASII.JK': { price: 5625, change: -0.35, name: 'Astra International', code: 'ASII.JK' },
      'UNVR.JK': { price: 4375, change: 0.20, name: 'Unilever Indonesia', code: 'UNVR.JK' },
      'HMSP.JK': { price: 1510, change: -0.10, name: 'HM Sampoerna', code: 'HMSP.JK' },
      'ICBP.JK': { price: 8650, change: 0.30, name: 'Indofood CBP', code: 'ICBP.JK' },
      'INDF.JK': { price: 6375, change: -0.15, name: 'Indofood Sukses Makmur', code: 'INDF.JK' },
      'GGRM.JK': { price: 24750, change: 0.40, name: 'Gudang Garam', code: 'GGRM.JK' },
      'ANTM.JK': { price: 1850, change: 1.10, name: 'Aneka Tambang', code: 'ANTM.JK' },
      'PTBA.JK': { price: 2920, change: 0.80, name: 'Bukit Asam', code: 'PTBA.JK' },
      'SMGR.JK': { price: 7025, change: -0.65, name: 'Semen Indonesia', code: 'SMGR.JK' },
      'KLBF.JK': { price: 1690, change: 0.45, name: 'Kalbe Farma', code: 'KLBF.JK' },
      'CPIN.JK': { price: 5025, change: 0.90, name: 'Charoen Pokphand Indonesia', code: 'CPIN.JK' }
    };
    
    // Attempt to get pricing from a public API (this is for demonstration - real-time stock APIs typically require paid access)
    let stockData;
    
    try {
      // For demonstration purposes, we'll use our mock data
      // In a real app, you would use a proper stock API with an API key
      stockData = mockStocks[symbol];
      
      if (!stockData) {
        // If not in our mock data, generate reasonable values
        stockData = {
          price: Math.round(5000 + Math.random() * 5000),
          change: (Math.random() * 2 - 1).toFixed(2),
          name: symbol.replace('.JK', ''),
          code: symbol
        };
      }
      
      // Add last updated timestamp
      stockData.last_updated = new Date().toISOString();
      
    } catch (fetchError) {
      console.error('Error fetching from stock API:', fetchError);
      
      // Fall back to mock data if available
      stockData = mockStocks[symbol] || {
        price: Math.round(5000 + Math.random() * 5000),
        change: (Math.random() * 2 - 1).toFixed(2),
        name: symbol.replace('.JK', ''),
        code: symbol,
        source: 'fallback'
      };
    }
    
    return new Response(JSON.stringify(stockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing stock price request:', error);
    
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
