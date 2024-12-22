import { Input } from '@/components/ui/input';
import { ArrowDownUp, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TokenInputsProps {
  amount: string;
  tokenAddress: string;
  onAmountChange: (value: string) => void;
  onTokenAddressChange: (value: string) => void;
  priceQuote: number | null;
  isLoading?: boolean;
  disabled?: boolean;
}

const QUICK_BUY_AMOUNTS = [0.25, 0.5, 1, 2, 5, 10];

export const TokenInputs = ({
  amount,
  tokenAddress,
  onAmountChange,
  onTokenAddressChange,
  priceQuote,
  isLoading = false,
  disabled = false,
}: TokenInputsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {QUICK_BUY_AMOUNTS.map((value) => (
          <Button
            key={value}
            variant="outline"
            onClick={() => onAmountChange(value.toString())}
            disabled={disabled}
            className="bg-primary/10 border-primary/20 hover:bg-primary/20 active:bg-primary/30 text-primary rounded-xl transition-colors"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            {value}
          </Button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount to buy in SOL</label>
        <Input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full bg-black/30"
          min="0"
          max="100000"
          step="0.000001"
          disabled={disabled}
        />
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
          `Estimated output: ${priceQuote.toFixed(6)} tokens`
        ) : null}
      </div>
    </div>
  );
};