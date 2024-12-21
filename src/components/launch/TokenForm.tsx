import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState, useEffect } from "react";

export interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  decimals: string;
  initialSupply: string;
}

interface TokenFormProps {
  onSubmit: (data: TokenFormData) => void;
  isSubmitting: boolean;
  isWalletConnected: boolean;
  hasEnoughBalance: boolean;
}

export const TokenForm = ({ 
  onSubmit, 
  isSubmitting, 
  isWalletConnected,
  hasEnoughBalance 
}: TokenFormProps) => {
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    description: "",
    decimals: "9",
    initialSupply: "1000000"
  });

  // Add debug logging for props
  useEffect(() => {
    console.log('TokenForm: Props state:', {
      isSubmitting,
      isWalletConnected,
      hasEnoughBalance,
      buttonDisabled: isSubmitting || !isWalletConnected || !hasEnoughBalance
    });
  }, [isSubmitting, isWalletConnected, hasEnoughBalance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TokenForm: Form submitted with data:', formData);
    onSubmit(formData);
  };

  // Calculate button state
  const buttonDisabled = !isWalletConnected || !hasEnoughBalance || isSubmitting;
  const buttonText = !isWalletConnected 
    ? "Connect Wallet to Create" 
    : !hasEnoughBalance
      ? "Insufficient SOL Balance"
      : isSubmitting 
        ? "Creating coin..." 
        : "Create coin";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-primary block">name</label>
        <Input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
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
            onChange={handleChange}
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
          onChange={handleChange}
          placeholder="Enter coin description" 
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-primary block">decimals</label>
        <Input 
          type="number" 
          name="decimals"
          value={formData.decimals}
          onChange={handleChange}
          placeholder="Enter number of decimals" 
          min="0"
          max="9"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-primary block">initial supply</label>
        <Input 
          type="number" 
          name="initialSupply"
          value={formData.initialSupply}
          onChange={handleChange}
          placeholder="Enter initial supply" 
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-primary block">image or video</label>
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">drag and drop an image or video</p>
          <Button variant="outline" size="sm" type="button">
            select file
          </Button>
        </div>
      </div>

      <div>
        <Button variant="link" className="text-primary p-0" type="button">
          show more options ↓
        </Button>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={buttonDisabled}
      >
        {buttonText}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        when your coin completes its bonding curve you receive 0.5 SOL
      </p>
    </form>
  );
};