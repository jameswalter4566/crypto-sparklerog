import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
  onProfileSaved: (displayName: string, avatarUrl: string | null) => void;
}

export const ProfileSetup = ({ open, onOpenChange, walletAddress, onProfileSaved }: ProfileSetupProps) => {
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const saveProfile = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${walletAddress}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          finalAvatarUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          wallet_address: walletAddress,
          display_name: displayName,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Profile saved successfully!");
      onProfileSaved(displayName, finalAvatarUrl);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-black border-l border-gray-800">
        <SheetHeader>
          <SheetTitle className="text-white">Complete Your Profile</SheetTitle>
          <SheetDescription className="text-gray-400">
            Set up your display name and profile picture
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <ProfileAvatar 
              displayName={displayName}
              avatarUrl={avatarUrl}
              size="lg"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="max-w-xs"
              aria-label="Upload profile picture"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="bg-gray-900 border-gray-700 text-white"
              aria-label="Display name"
            />
          </div>
          <Button
            onClick={saveProfile}
            disabled={loading || !displayName}
            className="w-full"
            aria-label={loading ? "Saving profile..." : "Save profile"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};