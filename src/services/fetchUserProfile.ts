import { supabase } from '@/integrations/supabase/client';
import type { ParticipantProfile } from '@/components/voice-chat/types';

export async function fetchUserProfile(uid: number): Promise<ParticipantProfile | null> {
  try {
    // First get the wallet address from the voice_chat_users mapping
    const { data: mappingData, error: mappingError } = await supabase
      .from('voice_chat_users')
      .select('wallet_address')
      .eq('uid', uid)
      .maybeSingle();

    if (mappingError) {
      console.error("[fetchUserProfile] Error fetching voice chat user mapping:", mappingError);
      return null;
    }

    if (!mappingData?.wallet_address) {
      console.log("[fetchUserProfile] No wallet address mapping found for UID:", uid);
      return null;
    }

    // Then get the profile using the wallet address
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('wallet_address', mappingData.wallet_address)
      .maybeSingle();

    if (profileError) {
      console.error("[fetchUserProfile] Error fetching profile:", profileError);
      return null;
    }

    return profileData as ParticipantProfile;
  } catch (error) {
    console.error("[fetchUserProfile] Unexpected error:", error);
    return null;
  }
}

// Add a new function to store the UID mapping
export async function storeVoiceChatUID(uid: number, walletAddress: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('voice_chat_users')
      .upsert({ 
        uid,
        wallet_address: walletAddress
      })
      .select();

    if (error) {
      console.error("[storeVoiceChatUID] Error storing voice chat UID:", error);
      throw error;
    }

    console.log("[storeVoiceChatUID] Successfully stored UID mapping:", { uid, walletAddress });
  } catch (error) {
    console.error("[storeVoiceChatUID] Unexpected error:", error);
    throw error;
  }
}