import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

interface CopyAddressButtonProps {
  solanaAddr?: string;
}

export const CopyAddressButton = ({ solanaAddr }: CopyAddressButtonProps) => {
  const { toast } = useToast();

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

  return (
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
  );
};