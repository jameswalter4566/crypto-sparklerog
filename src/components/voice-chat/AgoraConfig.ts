import { supabase } from "@/integrations/supabase/client";

export const getAgoraAppId = async () => {
  try {
    const { data, error } = await supabase.rpc('get_secret', {
      secret_name: 'AGORA_APP_ID'
    });
    
    if (error) {
      console.error('Error fetching Agora App ID:', error);
      return null;
    }
    
    // Extract the secret value from the returned data
    if (Array.isArray(data) && data.length > 0 && 'secret' in data[0]) {
      return data[0].secret;
    }
    
    console.error('Invalid data structure returned from get_secret');
    return null;
  } catch (err) {
    console.error('Failed to fetch Agora App ID:', err);
    return null;
  }
};

export const DEFAULT_TOKEN = null;