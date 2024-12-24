import { Input } from '@/components/ui/input';
import { ArrowDownUp, Loader2, DollarSign } from 'lucide-react';

interface TokenInputsProps {
  amount: string;
  tokenAddress: string;
  onAmountChange: (value: string) => void;
  onTokenAddressChange: (value: string) => void;
  priceQuote: number | null;
  isLoading?: boolean;
  disabled?: boolean;
  mode?: 'buy' | 'sell';
  tokenBalance?: number | null;
}

export const TokenInputs = ({
  amount,
  tokenAddress,
  onAmountChange,
  onTokenAddressChange,
  priceQuote,
  isLoading = false,
  disabled = false,
  mode = 'buy',
  tokenBalance
}: TokenInputsProps) => {
  return (
    <div className="space-y-4">
      {mode === 'buy' && (
        <div className="grid grid-cols-3 gap-2">
          {[0.25, 0.5, 1, 2, 5, 10].map((value) => (
            <button
              key={value}
              onClick={() => onAmountChange(value.toString())}
              disabled={disabled}
              className="bg-primary/10 border border-primary/20 hover:bg-primary/20 active:bg-primary/30 text-white rounded-xl transition-colors px-4 py-2 flex items-center justify-center gap-1"
            >
              <DollarSign className="h-4 w-4" />
              {value}
            </button>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          {mode === 'buy' ? 'Amount in SOL' : 'Amount of tokens to sell'}
        </label>
        <Input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full bg-black/30"
          min="0"
          max={mode === 'sell' && tokenBalance ? tokenBalance.toString() : "100000"}
          step="0.000001"
          disabled={disabled}
        />
        {mode === 'sell' && tokenBalance && (
          <div className="text-sm text-gray-400 mt-1">
            Available balance: {tokenBalance.toFixed(6)} tokens
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <ArrowDownUp className="text-gray-400" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Token Address</label>
        <Input
          type="text"
          placeholder="Enter token address"
          value={tokenAddress}
          onChange={(e) => onTokenAddressChange(e.target.value)}
          className="w-full bg-black/30"
          disabled={disabled}
        />
      </div>

      <div className="text-sm text-gray-400 flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching quote...
          </>
        ) : priceQuote ? (
          `Estimated ${mode === 'buy' ? 'output' : 'SOL received'}: ${mode === 'buy' ? 
            priceQuote.toFixed(6) + ' tokens' : 
            priceQuote.toFixed(6) + ' SOL'}`
        ) : null}
      </div>
    </div>
  );
};