// src/services/fetchUserProfile.ts
import { supabase } from '@/integrations/supabase/client';
import type { ParticipantProfile } from '@/components/voice-chat/types';

export async function fetchUserProfile(uid: number): Promise<ParticipantProfile | null> {
  // Convert uid to a unique identifier (e.g., a wallet address) to lookup the profile.
  // For demonstration, we'll assume uid maps directly to 'wallet_address'.
  const wallet_address = String(uid); // Adjust this logic as needed.

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('wallet_address', wallet_address)
    .maybeSingle();

  if (error) {
    console.error("[fetchUserProfile] Error fetching profile:", error);
    return null;
  }

  return data as ParticipantProfile || null;
}
