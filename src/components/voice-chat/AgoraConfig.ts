import { supabase } from "@/integrations/supabase/client";

export const getAgoraAppId = async () => {
  const { data, error } = await supabase.rpc('get_secret', {
    secret_name: 'AGORA_APP_ID'
  });
  
  if (error) {
    console.error('Error fetching Agora App ID:', error);
    return null;
  }
  
  return data;
};

export const DEFAULT_TOKEN = null; // For development, can be null. In production, implement token server