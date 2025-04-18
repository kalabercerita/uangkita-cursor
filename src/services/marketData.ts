import { supabase } from '@/integrations/supabase/client';

interface ExchangeRate {
  rate: number;
  timestamp: string;
}

interface MetalPrice {
  gold: number;    // per gram in IDR
  silver: number;  // per gram in IDR
  timestamp: string;
}

export const getExchangeRate = async (): Promise<ExchangeRate> => {
  try {
    // Menggunakan Wise API untuk kurs USD/IDR
    const response = await fetch('https://api.wise.com/v1/rates?source=USD&target=IDR');
    const data = await response.json();
    
    return {
      rate: data[0].rate,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

export const getMetalPrices = async (): Promise<MetalPrice> => {
  try {
    // Menggunakan Kitco API untuk harga emas dan perak dalam USD
    const response = await fetch('https://api.kitco.com/v1/market_data/precious_metals');
    const data = await response.json();
    
    // Konversi troy ounce ke gram (1 troy ounce = 31.1034768 gram)
    const gramsPerOunce = 31.1034768;
    
    // Dapatkan kurs USD/IDR terkini
    const { rate: usdToIdr } = await getExchangeRate();
    
    // Hitung harga dalam IDR per gram
    const goldPricePerGram = (data.gold.price / gramsPerOunce) * usdToIdr;
    const silverPricePerGram = (data.silver.price / gramsPerOunce) * usdToIdr;
    
    return {
      gold: goldPricePerGram,
      silver: silverPricePerGram,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching metal prices:', error);
    throw error;
  }
}; 