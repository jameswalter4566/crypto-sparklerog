interface PriceChangeProps {
  change24h: number | null;
}

export function PriceChange({ change24h }: PriceChangeProps) {
  // Validate the change24h value
  const formatChange = (value: number | null): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return "N/A";
    }
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <span
      className={`${
        typeof change24h === "number" && change24h >= 0
          ? "text-secondary"
          : "text-red-500"
      } font-semibold`}
    >
      {formatChange(change24h)}
    </span>
  );
}
