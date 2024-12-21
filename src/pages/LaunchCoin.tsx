import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createToken } from "@/lib/solana/tokenCreator";
import { useToast } from "@/components/ui/use-toast";

export default function LaunchCoin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    decimals: "9",
    initialSupply: "1000000"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const tokenConfig = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: parseInt(formData.decimals),
        initialSupply: parseInt(formData.initialSupply)
      };

      const result = await createToken(tokenConfig);

      if (result.success) {
        toast({
          title: "Token Created Successfully!",
          description: `Mint Address: ${result.mintAddress}`,
        });
        navigate('/rocket-launch');
      } else {
        toast({
          variant: "destructive",
          title: "Error Creating Token",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create token. Please try again.",
      });
    } finally {
      setIsCreating(false);
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
            <Button variant="outline" size="sm">
              select file
            </Button>
          </div>
        </div>

        <div>
          <Button variant="link" className="text-primary p-0">
            show more options ↓
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isCreating}>
          {isCreating ? "creating coin..." : "create coin"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          when your coin completes its bonding curve you receive 0.5 SOL
        </p>
      </form>
    </div>
  );
}