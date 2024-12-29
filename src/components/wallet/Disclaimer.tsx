import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Disclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="mt-2 bg-yellow-500/10 border-yellow-500/20">
      <AlertCircle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-500 flex items-center justify-between">
        Note: If you are unable to join voice chat after creating your profile... Refresh!
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 hover:text-yellow-400 transition-colors"
          aria-label="Close disclaimer"
        >
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
};