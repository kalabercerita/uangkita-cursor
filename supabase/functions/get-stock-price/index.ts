
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
      'BBCA.JK': { price: 9850, change: 0.75, name: 'Bank Central Asia' },
      'BBRI.JK': { price: 5200, change: -0.25, name: 'Bank Rakyat Indonesia' },
      'BMRI.JK': { price: 6100, change: 0.50, name: 'Bank Mandiri' },
      'TLKM.JK': { price: 3900, change: 0.10, name: 'Telkom Indonesia' },
      'ASII.JK': { price: 5750, change: -0.35, name: 'Astra International' },
      'UNVR.JK': { price: 4500, change: 0.20, name: 'Unilever Indonesia' },
      'HMSP.JK': { price: 1550, change: -0.10, name: 'HM Sampoerna' },
      'ICBP.JK': { price: 8750, change: 0.30, name: 'Indofood CBP' },
      'INDF.JK': { price: 6450, change: -0.15, name: 'Indofood Sukses Makmur' },
      'GGRM.JK': { price: 24500, change: 0.40, name: 'Gudang Garam' },
      'ANTM.JK': { price: 1825, change: 1.10, name: 'Aneka Tambang' },
      'PTBA.JK': { price: 2890, change: 0.80, name: 'Bukit Asam' },
      'SMGR.JK': { price: 6950, change: -0.65, name: 'Semen Indonesia' },
      'KLBF.JK': { price: 1675, change: 0.45, name: 'Kalbe Farma' },
      'CPIN.JK': { price: 4950, change: 0.90, name: 'Charoen Pokphand Indonesia' }
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
          name: symbol.replace('.JK', '')
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
