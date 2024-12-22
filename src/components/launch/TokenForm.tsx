import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  imageUrl: string;
  numDecimals: number;
  numberTokens: number;
}

interface TokenFormProps {
  formData: TokenFormData;
  setFormData: (data: TokenFormData) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

export const TokenForm = ({ formData, setFormData, isUploading, setIsUploading }: TokenFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      setFormData({ 
        ...formData, 
        image: file,
        imageUrl: publicUrl 
      });

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

  return (
    <div className="space-y-6">
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
                onClick={() => setFormData({ ...formData, image: null, imageUrl: "" })}
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
    </div>
  );
};