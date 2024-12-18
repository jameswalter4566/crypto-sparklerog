import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, BookmarkPlus, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadialBar, RadialBarChart, Legend } from 'recharts';

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

  const rugData = [
    {
      name: 'Rug Score',
      value: 90,
      fill: '#ea384c'
    }
  ];

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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-primary/10"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    RUG Analysis
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] bg-card p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">Dev Holdings</h3>
                      <p className="text-[#ea384c] font-semibold">
                        22.31% of supply ($6,780 USD)
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Dev wallet has been linked to 3 coin launches that all sold within 24 hours!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Token does not have any verified social media profiles linked.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div style={{ width: 100, height: 100 }}>
                        <RadialBarChart 
                          width={100} 
                          height={100}
                          innerRadius="60%"
                          outerRadius="100%"
                          data={rugData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar
                            background
                            dataKey="value"
                          />
                        </RadialBarChart>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">RUG SCORE</p>
                        <p className="text-2xl font-bold text-[#ea384c]">90%</p>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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