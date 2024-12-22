import { Input } from '@/components/ui/input';
import { ArrowDownUp } from 'lucide-react';

interface TokenInputsProps {
  amount: string;
  tokenAddress: string;
  onAmountChange: (value: string) => void;
  onTokenAddressChange: (value: string) => void;
  priceQuote: number | null;
}

export const TokenInputs = ({
  amount,
  tokenAddress,
  onAmountChange,
  onTokenAddressChange,
  priceQuote,
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
        />
      </div>

      {priceQuote && (
        <div className="text-sm text-gray-400">
          Estimated output: {priceQuote.toFixed(6)} tokens
        </div>
      )}
    </div>
  );
};