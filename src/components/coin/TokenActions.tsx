import { Button } from "@/components/ui/button";
import { Copy, BookmarkPlus, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadialBar, RadialBarChart } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { AskAgentButton } from "./AskAgentButton";
import { useState } from "react";

export const TokenActions = ({ symbol, solanaAddr }: { symbol: string; solanaAddr?: string }) => {
  const { toast } = useToast();
  const [rugAnalysis, setRugAnalysis] = useState({
    devAnalysis: "22.31% of supply ($6,780 USD)",
    launchAnalysis: "Dev wallet has been linked to 3 coin launches that all sold within 24 hours!",
    socialMediaStatus: "Token does not have any verified social media profiles linked.",
    rugScore: 90
  });

  // Mock data for demonstration - in a real app, this would come from your backend
  const mockCoinData = {
    devHoldings: "22.31% of supply ($6,780 USD)",
    launchHistory: "3 previous launches, all sold within 24h",
    socialMedia: "No verified profiles"
  };

  const handleCopyAddress = () => {
    if (solanaAddr) {
      navigator.clipboard.writeText(solanaAddr);
      toast({
        description: "Token mint address copied to clipboard",
      });
    } else {
      toast({
        description: "Token mint address not available",
        variant: "destructive"
      });
    }
  };

  const handleSaveToLibrary = () => {
    toast({
      description: "Token saved to library",
    });
  };

  const handleAnalysisComplete = (analysis: {
    devAnalysis: string;
    launchAnalysis: string;
    socialMediaStatus: string;
    rugScore: number;
  }) => {
    setRugAnalysis(analysis);
  };

  const rugData = [
    {
      name: 'Rug Score',
      value: rugAnalysis.rugScore,
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
              onClick={handleCopyAddress}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy mint address</p>
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
                {rugAnalysis.devAnalysis}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {rugAnalysis.launchAnalysis}
              </p>
              <p className="text-sm text-muted-foreground">
                {rugAnalysis.socialMediaStatus}
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
                <p className="text-2xl font-bold text-[#ea384c]">{rugAnalysis.rugScore}%</p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <AskAgentButton 
        onAnalysisComplete={handleAnalysisComplete}
        coinData={mockCoinData}
      />
    </div>
  );
};