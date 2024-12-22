import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TokenActions } from "./TokenActions";
import { CopyAddressButton } from "./CopyAddressButton";

interface TokenHeaderProps {
  name: string;
  symbol: string;
  image: string | null;
  price: number | null;
  description?: string | null;
  tokenStandard?: string | null;
  decimals?: number;
  solanaAddr?: string;
}

export const TokenHeader = ({ 
  name, 
  symbol, 
  image, 
  price,
  description,
  tokenStandard,
  decimals,
  solanaAddr
}: TokenHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={image || ""} alt={name} />
          <AvatarFallback>{symbol?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {name || "Unknown Token"} ({symbol || "???"})
            </h1>
            
            <TokenActions symbol={symbol} solanaAddr={solanaAddr} />

            {tokenStandard && (
              <Badge variant="outline" className="h-6">
                {tokenStandard}
              </Badge>
            )}
            {decimals !== undefined && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="h-6">
                      d{decimals}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{decimals} decimals</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-2xl font-bold">
            ${price?.toFixed(4) ?? "Price not available"}
          </p>
          {solanaAddr && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground font-mono">
                {solanaAddr}
              </span>
              <CopyAddressButton solanaAddr={solanaAddr} />
            </div>
          )}
        </div>
      </div>
      {description && (
        <p className="text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
};