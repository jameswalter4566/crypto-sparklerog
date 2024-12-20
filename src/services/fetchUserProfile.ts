import { supabase } from '@/integrations/supabase/client';
import type { ParticipantProfile } from '@/components/voice-chat/types';
import type { Database } from '@/integrations/supabase/types';

// Types for Supabase Tables
type VoiceChatUser = Database['public']['Tables']['voice_chat_users']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Fetches the user profile (screen name and avatar) using the Agora UID.
 *
 * @param uid Agora UID of the user.
 * @returns ParticipantProfile with display_name and avatar_url or null if not found.
 */
export async function fetchUserProfile(uid: number): Promise<ParticipantProfile | null> {
  try {
    // Step 1: Get the wallet address from the voice_chat_users table
    const { data: mappingData, error: mappingError } = await supabase
      .from('voice_chat_users')
      .select('wallet_address')
      .eq('uid', uid)
      .single();

    if (mappingError) {
      console.error('[fetchUserProfile] Error fetching voice chat user mapping:', mappingError);
      return null;
    }

    if (!mappingData?.wallet_address) {
      console.log('[fetchUserProfile] No wallet address mapping found for UID:', uid);
      return null;
    }

    // Step 2: Fetch the user profile using the wallet address
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('wallet_address', mappingData.wallet_address)
      .single();

    if (profileError) {
      console.error('[fetchUserProfile] Error fetching profile:', profileError);
      return null;
    }

    return profileData as ParticipantProfile;
  } catch (error) {
    console.error('[fetchUserProfile] Unexpected error:', error);
    return null;
  }
}

/**
 * Stores the mapping between an Agora UID and a user's wallet address.
 *
 * @param uid Agora UID of the user.
 * @param walletAddress Wallet address of the user.
 */
export async function storeVoiceChatUID(uid: number, walletAddress: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('voice_chat_users')
      .upsert({
        uid,
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[storeVoiceChatUID] Error storing voice chat UID:', error);
      throw error;
    }

    console.log('[storeVoiceChatUID] Successfully stored UID mapping:', { uid, walletAddress });
  } catch (error) {
    console.error('[storeVoiceChatUID] Unexpected error:', error);
    throw error;
  }
}
