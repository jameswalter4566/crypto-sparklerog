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
    devAnalysis: "Rug Analysis to be implemented in the upcoming patch update",
    launchAnalysis: "Rug Analysis to be implemented in the upcoming patch update",
    socialMediaStatus: "Rug Analysis to be implemented in the upcoming patch update",
    rugScore: null
  });

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
        coinData={{
          devHoldings: "To be implemented",
          launchHistory: "To be implemented",
          socialMedia: "To be implemented"
        }}
      />
    </div>
  );
};