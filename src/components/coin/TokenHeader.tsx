import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, BookmarkPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TokenHeaderProps {
  name: string;
  symbol: string;
  image: string | null;
  price: number | null;
  description?: string | null;
  tokenStandard?: string | null;
  decimals?: number;
}

export const TokenHeader = ({ 
  name, 
  symbol, 
  image, 
  price,
  description,
  tokenStandard,
  decimals 
}: TokenHeaderProps) => {
  const { toast } = useToast();

  const handleCopyToken = () => {
    navigator.clipboard.writeText(symbol);
    toast({
      description: "Token symbol copied to clipboard",
    });
  };

  const handleCopyPair = () => {
    navigator.clipboard.writeText(`${symbol}/USD`);
    toast({
      description: "Trading pair copied to clipboard",
    });
  };

  const handleSaveToLibrary = () => {
    toast({
      description: "Token saved to library",
    });
  };

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
            
            <div className="flex items-center gap-2 ml-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10"
                      onClick={handleCopyToken}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy token</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10"
                      onClick={handleCopyPair}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy pair</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-primary/10"
                onClick={handleSaveToLibrary}
              >
                <BookmarkPlus className="h-4 w-4" />
                Save to Library
              </Button>
            </div>

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