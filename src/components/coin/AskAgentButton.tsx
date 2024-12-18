import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export const AskAgentButton = () => {
  const [isListening, setIsListening] = useState(false);

  const handleClick = () => {
    setIsListening(!isListening);
    // Voice functionality will be added later
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 bg-primary/10 hover:bg-primary/20 transition-all duration-300 ${
        isListening ? "animate-glow-pulse" : ""
      }`}
      onClick={handleClick}
    >
      <Mic className={`h-4 w-4 ${isListening ? "text-primary animate-pulse" : ""}`} />
      {isListening ? "Listening..." : "Ask Agent"}
    </Button>
  );
};