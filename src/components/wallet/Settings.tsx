import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SettingsProps {
  walletAddress: string;
  currentDisplayName: string | null;
  onProfileUpdate: (newDisplayName: string, newAvatarUrl: string | null) => void;
}

export const Settings = ({ walletAddress, currentDisplayName, onProfileUpdate }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(currentDisplayName || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Get the last update timestamp
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_profile_update')
        .eq('wallet_address', walletAddress)
        .single();

      if (profile) {
        const lastUpdate = new Date(profile.last_profile_update);
        const now = new Date();
        const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastUpdate < 24) {
          const hoursRemaining = Math.ceil(24 - hoursSinceLastUpdate);
          toast.error(`Please wait ${hoursRemaining} hours before updating your profile again`);
          return;
        }
      }

      let newAvatarUrl = null;

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

          newAvatarUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: newDisplayName,
          avatar_url: newAvatarUrl || undefined,
          last_profile_update: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      onProfileUpdate(newDisplayName, newAvatarUrl);
      toast.success("Profile updated successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-black border-l border-gray-800">
        <SheetHeader>
          <SheetTitle className="text-white">Profile Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Display Name</label>
            <Input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Profile Picture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !newDisplayName}
            className="w-full"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};