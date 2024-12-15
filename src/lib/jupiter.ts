import { supabase } from "@/integrations/supabase/client";

export async function fetchJupiterPrices() {
  try {
    // Fetch prices from our Edge Function
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/fetch-prices`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data: updates, error: fetchError } = await response.json();
    
    if (fetchError) {
      console.error('Error fetching prices:', fetchError);
      return null;
    }

    // Update Supabase database
    const { error: upsertError } = await supabase
      .from('coins')
      .upsert(updates, { onConflict: 'id' });

    if (upsertError) {
      console.error('Error updating coins:', upsertError);
      return null;
    }

    return updates;
  } catch (error) {
    console.error('Error fetching Jupiter prices:', error);
    return null;
  }
}