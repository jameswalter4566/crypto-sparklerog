interface PriceChangeProps {
  change24h: number;
}

export function PriceChange({ change24h }: PriceChangeProps) {
  return (
    <span
      className={`${
        change24h >= 0 ? "text-secondary" : "text-red-500"
      } font-semibold`}
    >
      {change24h >= 0 ? "+" : ""}
      {change24h.toFixed(2)}%
    </span>
  );
}