import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TokenInputs } from './swap/TokenInputs';
import { useSwap } from '@/hooks/useSwap';
import { Loader2 } from 'lucide-react';

interface SwapInterfaceProps {
  defaultTokenAddress?: string;
}

export const SwapInterface = ({ defaultTokenAddress }: SwapInterfaceProps) => {
  const {
    amount,
    tokenAddress,
    isLoading,
    isQuoteLoading,
    priceQuote,
    handleAmountChange,
    handleTokenAddressChange,
    handleSwap,
  } = useSwap(defaultTokenAddress);

  return (
    <Card className="p-8 max-w-xl w-full mx-auto bg-black/50 backdrop-blur-sm border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Buy</h2>
      
      <TokenInputs
        amount={amount}
        tokenAddress={tokenAddress}
        onAmountChange={handleAmountChange}
        onTokenAddressChange={handleTokenAddressChange}
        priceQuote={priceQuote}
        isLoading={isQuoteLoading}
        disabled={isLoading}
      />

      <Button 
        onClick={handleSwap} 
        disabled={isLoading || !amount || !tokenAddress || isQuoteLoading}
        className="w-full mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Buy Now'
        )}
      </Button>
    </Card>
  );
};