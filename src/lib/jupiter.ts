import { supabase } from "@/integrations/supabase/client";

export async function fetchJupiterPrices(context: { queryKey: string[] }) {
  const [_key, address] = context.queryKey;
  
  const { data, error } = await supabase.functions.invoke('fetch-prices', {
    body: { address }
  });

  if (error) {
    console.error('Error fetching Jupiter prices:', error);
    throw error;
  }

  return data;
}