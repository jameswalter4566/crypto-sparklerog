import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createToken } from "@/lib/solana/tokenCreator";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletStatus } from "@/components/launch/WalletStatus";
import { TokenForm, TokenFormData } from "@/components/launch/TokenForm";

// Debug component to show wallet state
const DebugOverlay = ({ connected, publicKey, solBalance }: { 
  connected: boolean;
  publicKey: string | null;
  solBalance: number;
}) => (
  <div className="fixed top-0 left-0 bg-black/70 text-white p-4 z-50 font-mono text-xs">
    <h3 className="font-bold mb-2">Wallet Debug Info:</h3>
    <p>Connected: {String(connected)}</p>
    <p>Public Key: {publicKey || 'None'}</p>
    <p>Balance: {solBalance} SOL</p>
  </div>
);

export default function LaunchCoin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [isCreating, setIsCreating] = useState(false);
  const [solBalance, setSolBalance] = useState(0);

  // Debug logs for component mount and state initialization
  useEffect(() => {
    console.log('LaunchCoin: Component mounted with initial state:', {
      connected,
      publicKey: publicKey?.toBase58(),
      solBalance,
      isCreating
    });
  }, []);

  // Debug log for wallet state changes
  useEffect(() => {
    console.log('LaunchCoin: Wallet state updated:', {
      connected,
      publicKey: publicKey?.toBase58(),
      solBalance,
      isCreating,
      buttonShouldBeEnabled: connected && solBalance >= 0.1 && !isCreating
    });
  }, [connected, publicKey, solBalance, isCreating]);

  const handleBalanceChange = (balance: number) => {
    console.log('LaunchCoin: Balance update received:', balance);
    setSolBalance(balance);
  };

  const handleSubmit = async (formData: TokenFormData) => {
    if (!publicKey || !connected) {
      console.log('LaunchCoin: Submit attempted without wallet connection');
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet before creating a token.",
      });
      return;
    }

    setIsCreating(true);
    console.log('LaunchCoin: Starting token creation...');

    try {
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

      if ('success' in result && result.success) {
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
          description: result.error || "Failed to create token",
        });
      }
    } catch (error) {
      console.error('LaunchCoin: Token creation error:', error);
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
      {process.env.NODE_ENV === 'development' && (
        <DebugOverlay 
          connected={connected} 
          publicKey={publicKey?.toBase58() || null} 
          solBalance={solBalance} 
        />
      )}

      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      <WalletStatus onBalanceChange={handleBalanceChange} />

      <TokenForm 
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        isWalletConnected={!!connected}
        hasEnoughBalance={solBalance >= 0.1}
      />
    </div>
  );
}