import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const loadProfile = async (address: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('wallet_address', address)
      .single();

    if (data) {
      setDisplayName(data.display_name || '');
      setAvatarUrl(data.avatar_url);
      setShowProfileSetup(false);
    } else {
      setShowProfileSetup(true);
    }
  };

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
        toast.error("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
        return;
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      setConnected(true);
      toast.success("Wallet connected!");
      console.log("Connected with Public Key:", address);
      await loadProfile(address);
    } catch (error) {
      console.error(error);
      toast.error("Error connecting wallet");
    }
  };

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
        const filePath = `${walletAddress}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
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
      setShowProfileSetup(false);
    } catch (error) {
      console.error(error);
      toast.error("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const { solana } = window;
    if (solana?.isPhantom && solana.isConnected) {
      setConnected(true);
      const address = solana.publicKey.toString();
      setWalletAddress(address);
      loadProfile(address);
    }
  }, []);

  return (
    <>
      <button
        onClick={connectWallet}
        className="fixed top-4 right-4 hover:opacity-80 transition-opacity"
      >
        <img
          src="/1200x1200.png"
          alt="Phantom Wallet"
          className="w-10 h-10 rounded-full"
        />
        <span className="sr-only">Connect Phantom Wallet</span>
      </button>

      <Sheet open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-black border-l border-gray-800">
          <SheetHeader>
            <SheetTitle className="text-white">Complete Your Profile</SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-gray-800 text-white">
                  {displayName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="max-w-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={saveProfile}
              disabled={loading || !displayName}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};