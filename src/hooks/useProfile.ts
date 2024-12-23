import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProfile = () => {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const loadProfile = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("wallet_address", address)
        .maybeSingle();

      if (error) {
        console.error("[useProfile] Error loading profile:", error);
        return;
      }

      if (data) {
        setDisplayName(data.display_name);
        setAvatarUrl(data.avatar_url);
        setShowProfileSetup(false);

        localStorage.setItem(
          "userProfile",
          JSON.stringify({ displayName: data.display_name, avatarUrl: data.avatar_url })
        );
      } else {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error("[useProfile] Error in loadProfile:", error);
    }
  };

  const handleProfileSaved = (newDisplayName: string, newAvatarUrl: string | null) => {
    setDisplayName(newDisplayName);
    setAvatarUrl(newAvatarUrl);
    setShowProfileSetup(false);

    localStorage.setItem(
      "userProfile",
      JSON.stringify({ displayName: newDisplayName, avatarUrl: newAvatarUrl })
    );
  };

  return {
    displayName,
    avatarUrl,
    showProfileSetup,
    setShowProfileSetup,
    loadProfile,
    handleProfileSaved
  };
};