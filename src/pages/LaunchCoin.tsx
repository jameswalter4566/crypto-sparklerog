import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTokenLaunch } from "@/hooks/useTokenLaunch";
import { TokenConfig } from "@/services/token/types";
import { Keypair } from "@solana/web3.js";
import { toast } from "sonner";
import { TokenForm } from "@/components/launch/TokenForm";

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
  const [isUploading, setIsUploading] = useState(false);
  const { launchToken, requestAirdrop, isLaunching } = useTokenLaunch();

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
        <TokenForm 
          formData={formData}
          setFormData={setFormData}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />

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