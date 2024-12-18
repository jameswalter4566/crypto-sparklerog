import { Button } from "@/components/ui/button";
import { Copy, BookmarkPlus, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadialBar, RadialBarChart } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { AskAgentButton } from "./AskAgentButton";

export const TokenActions = ({ symbol }: { symbol: string }) => {
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
    <div className="flex items-center gap-2">
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

      <AskAgentButton />
    </div>
  );
};