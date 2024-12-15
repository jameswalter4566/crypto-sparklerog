import { supabase } from "@/integrations/supabase/client";

export async function fetchTokenData(context: { queryKey: string[] }) {
  const [_key, address] = context.queryKey;
  
  const { data, error } = await supabase.functions.invoke('fetch-prices', {
    body: { address }
  });

  if (error) throw error;
  return data;
}