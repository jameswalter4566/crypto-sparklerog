import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Rocket, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTokenLaunch } from "@/hooks/useTokenLaunch";
import { TokenConfig } from "@/services/token/types";
import { Keypair } from "@solana/web3.js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function LaunchCoin() {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    image: null as File | null,
    imageUrl: "",
    numDecimals: 9,
    numberTokens: 1000000
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { launchToken, requestAirdrop, isLaunching } = useTokenLaunch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ 
        ...prev, 
        image: file,
        imageUrl: publicUrl 
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.imageUrl) {
      toast.error("Please upload an image for your token");
      return;
    }

    try {
      // Generate a new keypair for the token creator
      const wallet = Keypair.generate();
      
      // Request an airdrop of SOL to pay for the transaction
      await requestAirdrop(wallet);

      const tokenConfig: TokenConfig = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUrl,
        numDecimals: formData.numDecimals,
        numberTokens: formData.numberTokens
      };

      const txId = await launchToken(tokenConfig, wallet);
      toast.success(`Token launched successfully! Transaction ID: ${txId}`);
    } catch (error) {
      console.error("Error launching token:", error);
      toast.error("Failed to launch token. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-primary block">name</label>
          <Input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter coin name" 
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-primary block">ticker</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-muted-foreground">$</span>
            </div>
            <Input 
              className="pl-7" 
              type="text" 
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder="Enter ticker symbol" 
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-primary block">description</label>
          <Textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter coin description" 
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-primary block">image</label>
          <div 
            className="border-2 border-dashed border-muted rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {formData.imageUrl ? (
              <div className="space-y-4">
                <img 
                  src={formData.imageUrl} 
                  alt="Token" 
                  className="mx-auto h-32 w-32 object-cover rounded-lg"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, image: null, imageUrl: "" }))}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <>
                {isUploading ? (
                  <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">drag and drop an image</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        select file
                      </Button>
                    </label>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <Button 
            type="button"
            variant="link" 
            className="text-primary p-0"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "hide advanced options ↑" : "show advanced options ↓"}
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-primary block">decimals</label>
              <Input 
                type="number" 
                name="numDecimals"
                value={formData.numDecimals}
                onChange={handleInputChange}
                min="0"
                max="9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-primary block">total supply</label>
              <Input 
                type="number" 
                name="numberTokens"
                value={formData.numberTokens}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLaunching || isUploading}
        >
          {isLaunching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              launching...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              launch coin
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          when your coin completes its bonding curve you receive 0.5 SOL
        </p>
      </form>
    </div>
  );
}