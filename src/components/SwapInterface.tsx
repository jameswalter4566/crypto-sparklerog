import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TokenInputs } from './swap/TokenInputs';
import { useSwap } from '@/hooks/useSwap';
import { Loader2, ArrowDownUp } from 'lucide-react';
import { useState } from 'react';

interface SwapInterfaceProps {
  defaultTokenAddress?: string;
}

export const SwapInterface = ({ defaultTokenAddress }: SwapInterfaceProps) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const {
    amount,
    tokenAddress,
    isLoading,
    isQuoteLoading,
    priceQuote,
    handleAmountChange,
    handleTokenAddressChange,
    handleSwap,
    handleSell,
    tokenBalance,
  } = useSwap(defaultTokenAddress);

  const handleSellPercentage = (percentage: number) => {
    if (tokenBalance) {
      const sellAmount = (tokenBalance * percentage).toString();
      handleAmountChange(sellAmount);
    }
  };

  return (
    <Card className="p-8 max-w-xl w-full mx-auto bg-black/50 backdrop-blur-sm border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{mode === 'buy' ? 'Buy' : 'Sell'}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode(mode === 'buy' ? 'sell' : 'buy')}
          className="flex items-center gap-2"
        >
          <ArrowDownUp className="h-4 w-4" />
          Switch to {mode === 'buy' ? 'Sell' : 'Buy'}
        </Button>
      </div>
      
      {mode === 'sell' && (
        <>
          {tokenBalance && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => handleSellPercentage(0.25)}
                className="bg-primary/10 border-primary/20 hover:bg-primary/20"
              >
                25%
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSellPercentage(0.5)}
                className="bg-primary/10 border-primary/20 hover:bg-primary/20"
              >
                50%
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSellPercentage(1)}
                className="bg-primary/10 border-primary/20 hover:bg-primary/20"
              >
                100%
              </Button>
            </div>
          )}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4 text-sm text-yellow-200">
            <p>If your sell button is experiencing glitches, you can always swap directly from your Phantom wallet:</p>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Open Phantom wallet</li>
              <li>Select Swap</li>
              <li>Select the coin you bought and swap back into Solana to cash out!</li>
            </ol>
          </div>
        </>
      )}

      <TokenInputs
        amount={amount}
        tokenAddress={tokenAddress}
        onAmountChange={handleAmountChange}
        onTokenAddressChange={handleTokenAddressChange}
        priceQuote={priceQuote}
        isLoading={isQuoteLoading}
        disabled={isLoading}
        mode={mode}
        tokenBalance={tokenBalance}
      />

      <Button 
        onClick={mode === 'buy' ? handleSwap : handleSell}
        disabled={isLoading || !amount || !tokenAddress || isQuoteLoading}
        className="w-full mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          mode === 'buy' ? 'Buy Now' : 'Sell Now'
        )}
      </Button>
    </Card>
  );
};