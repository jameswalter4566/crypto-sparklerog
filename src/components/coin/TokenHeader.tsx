import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TokenHeaderProps {
  name: string;
  symbol: string;
  image: string | null;
  price: number | null;
}

export const TokenHeader = ({ name, symbol, image, price }: TokenHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Avatar className="w-12 h-12">
        <AvatarImage src={image || ""} alt={name} />
        <AvatarFallback>{symbol?.[0] || "?"}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {name || "Unknown Token"} ({symbol || "???"})
        </h1>
        <p className="text-2xl font-bold">
          ${price?.toFixed(4) ?? "Price not available"}
        </p>
      </div>
    </div>
  );
};