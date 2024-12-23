interface PriceChangeProps {
  change24h: number | null;
}

export function PriceChange({ change24h }: PriceChangeProps) {
  if (typeof change24h !== "number" || isNaN(change24h)) {
    return <span className="text-gray-400">N/A</span>;
  }

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
