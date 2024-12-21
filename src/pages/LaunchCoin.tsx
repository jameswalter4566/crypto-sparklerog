import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createToken } from "@/lib/solana/tokenCreator";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletStatus } from "@/components/launch/WalletStatus";
import { TokenForm, TokenFormData } from "@/components/launch/TokenForm";

export default function LaunchCoin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [isCreating, setIsCreating] = useState(false);
  const [solBalance, setSolBalance] = useState(0);

  // Add detailed logging for component mount and updates
  useEffect(() => {
    console.log('LaunchCoin: Component mounted/updated');
    console.log('LaunchCoin: Initial state:', {
      connected,
      publicKey: publicKey?.toBase58(),
      solBalance,
      isCreating
    });
  }, []);

  // Add logging for wallet connection changes
  useEffect(() => {
    console.log('LaunchCoin: Wallet connection changed:', {
      connected,
      publicKey: publicKey?.toBase58()
    });
  }, [connected, publicKey]);

  // Add logging for balance changes
  useEffect(() => {
    console.log('LaunchCoin: Balance state changed:', {
      solBalance,
      hasEnoughBalance: solBalance >= 0.1
    });
  }, [solBalance]);

  const handleBalanceChange = (balance: number) => {
    console.log('LaunchCoin: Balance update received:', balance);
    setSolBalance(balance);
  };

  const handleSubmit = async (formData: TokenFormData) => {
    console.log('LaunchCoin: Form submission attempted', {
      connected,
      publicKey: publicKey?.toBase58(),
      solBalance,
      formData
    });

    setIsCreating(true);

    try {
      if (!publicKey || !connected) {
        console.log('LaunchCoin: Submission blocked - wallet not connected');
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet before creating a token.",
        });
        return;
      }

      if (solBalance < 0.1) {
        console.log('LaunchCoin: Submission blocked - insufficient balance');
        toast({
          variant: "destructive",
          title: "Insufficient Balance",
          description: "You need at least 0.1 SOL to create a token.",
        });
        return;
      }

      const tokenConfig = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: parseInt(formData.decimals),
        initialSupply: parseInt(formData.initialSupply),
        feePayer: publicKey,
        connection
      };

      console.log('LaunchCoin: Creating token with config:', tokenConfig);
      const result = await createToken(tokenConfig);

      if (result.success) {
        console.log('LaunchCoin: Token created successfully:', result);
        toast({
          title: "Token Created Successfully!",
          description: `Mint Address: ${result.mintAddress}`,
        });
        navigate('/rocket-launch');
      } else {
        console.error('LaunchCoin: Token creation failed:', result.error);
        toast({
          variant: "destructive",
          title: "Error Creating Token",
          description: result.error,
        });
      }
    } catch (error) {
      console.error('LaunchCoin: Unexpected error:', error);
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

      <WalletStatus onBalanceChange={handleBalanceChange} />

      <TokenForm 
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        isWalletConnected={connected}
        hasEnoughBalance={solBalance >= 0.1}
      />
    </div>
  );
}