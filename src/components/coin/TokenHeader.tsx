import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TokenActions } from "./TokenActions";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { CopyAddressButton } from "./CopyAddressButton";

interface TokenHeaderProps {
  name: string;
  symbol: string;
  image: string | null;
  price: number | null;
  description?: string | null;
  tokenStandard?: string | null;
  decimals?: number;
  updatedAt: string;
  onRefresh: () => void;
  refreshing: boolean;
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
  solanaAddr,
  updatedAt,
  onRefresh,
  refreshing
}: TokenHeaderProps) => {

  const formattedUpdatedAt = new Date(updatedAt).toLocaleString();

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
            <CopyAddressButton solanaAddr={solanaAddr} />
            
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
          <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last updated: {formattedUpdatedAt}</span>
            </div>
            <Button 
              onClick={onRefresh} 
              variant="ghost" 
              size="sm" 
              className="ml-auto flex items-center gap-1"
              aria-label="Refresh coin data"
              disabled={refreshing}
            >
              {refreshing ? (
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                ) : (
                  <RefreshCw className="w-4 h-4" />
              )}
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
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