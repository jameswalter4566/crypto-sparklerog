import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AskAgentButton } from "./AskAgentButton";
import { useState } from "react";
import { CopyAddressButton } from "./CopyAddressButton";
import { RugAnalysis } from "./RugAnalysis";

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

  return (
    <div className="flex items-center gap-2">
      <CopyAddressButton solanaAddr={solanaAddr} />

      <Button
        variant="outline"
        size="sm"
        className="gap-2 hover:bg-primary/10"
        onClick={handleSaveToLibrary}
      >
        <BookmarkPlus className="h-4 w-4" />
        Save to Library
      </Button>

      <RugAnalysis rugAnalysis={rugAnalysis} />

      <AskAgentButton 
        onAnalysisComplete={handleAnalysisComplete}
        coinData={mockCoinData}
      />
    </div>
  );
};