import { supabase } from "@/integrations/supabase/client";

export const fetchJupiterPrices = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-prices')
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching Jupiter prices:', error)
    throw error
  }
}