import { supabase } from "@/integrations/supabase/client";

export const getAgoraAppId = async () => {
  try {
    console.log('Fetching Agora App ID from Supabase...');
    
    const { data, error } = await supabase.rpc('get_secret', {
      secret_name: 'AGORA_APP_ID'
    });
    
    if (error) {
      console.error('Error fetching Agora App ID:', error);
      return null;
    }
    
    // Add debug logging
    console.log('Received data from Supabase:', data);
    
    // Check if data exists and has the expected structure
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('Invalid data structure received:', data);
      return null;
    }
    
    const secret = data[0]?.secret;
    if (!secret) {
      console.error('No secret found in response');
      return null;
    }
    
    console.log('Successfully retrieved Agora App ID');
    return secret;
  } catch (err) {
    console.error('Failed to fetch Agora App ID:', err);
    return null;
  }
};

export const DEFAULT_TOKEN = null;