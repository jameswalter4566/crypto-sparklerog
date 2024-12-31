import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { tokenService } from "@/services/token/tokenService";

export default function LaunchCoin() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    image: null as File | null,
    telegramLink: "",
    websiteLink: "",
    twitterLink: "",
    initialSupply: 1000000000,
    decimals: 9
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // @ts-ignore
      if (!window.solana?.isPhantom) {
        toast.error("Please install Phantom wallet");
        return;
      }

      // @ts-ignore
      if (!window.solana?.isConnected) {
        toast.error("Please connect your wallet first");
        return;
      }

      const mintAddress = await tokenService.createToken({
        name: formData.name,
        symbol: formData.ticker.toUpperCase(),
        description: formData.description,
        image: formData.image,
        initialSupply: formData.initialSupply,
        decimals: formData.decimals,
        telegramLink: formData.telegramLink,
        websiteLink: formData.websiteLink,
        twitterLink: formData.twitterLink,
      });

      toast.success("Token created successfully!");
      console.log("Token created with mint address:", mintAddress);
      
      // Reset form
      setFormData({
        name: "",
        ticker: "",
        description: "",
        image: null,
        telegramLink: "",
        websiteLink: "",
        twitterLink: "",
        initialSupply: 1000000000,
        decimals: 9
      });
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Launch Your Coin</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create your own token on the Solana blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter coin name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="ticker">Ticker</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="ticker"
                  className="pl-7"
                  placeholder="SYMBOL"
                  value={formData.ticker}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your coin"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="image">Image or Video</Label>
              <div className="mt-1">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-black/30 bg-black/20"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG or MP4 (MAX. 5MB)</p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="initialSupply">Initial Supply</Label>
              <Input
                id="initialSupply"
                type="number"
                placeholder="1000000000"
                value={formData.initialSupply}
                onChange={(e) => setFormData(prev => ({ ...prev, initialSupply: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                type="number"
                placeholder="9"
                value={formData.decimals}
                onChange={(e) => setFormData(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
                required
                min="0"
                max="9"
              />
            </div>

            <div>
              <Label htmlFor="telegramLink">Telegram link (optional)</Label>
              <Input
                id="telegramLink"
                placeholder="https://t.me/yourcoin"
                value={formData.telegramLink}
                onChange={(e) => setFormData(prev => ({ ...prev, telegramLink: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="websiteLink">Website link (optional)</Label>
              <Input
                id="websiteLink"
                placeholder="https://yourcoin.com"
                value={formData.websiteLink}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteLink: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="twitterLink">Twitter or X link (optional)</Label>
              <Input
                id="twitterLink"
                placeholder="https://twitter.com/yourcoin"
                value={formData.twitterLink}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterLink: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-yellow-500">
              tip: coin data cannot be changed after creation
            </p>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "create coin"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              when your coin completes its bonding curve you receive 0.5 SOL
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}