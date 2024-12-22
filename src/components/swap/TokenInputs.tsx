import { Input } from '@/components/ui/input';
import { ArrowDownUp, Loader2 } from 'lucide-react';

interface TokenInputsProps {
  amount: string;
  tokenAddress: string;
  onAmountChange: (value: string) => void;
  onTokenAddressChange: (value: string) => void;
  priceQuote: number | null;
  isLoading?: boolean;
  disabled?: boolean;
}

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
      <div>
        <label className="block text-sm font-medium mb-1">Amount (SOL)</label>
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