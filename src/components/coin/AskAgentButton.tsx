import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare } from "lucide-react";

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
      className={`gap-2 transition-all duration-300 ${
        isListening ? "bg-primary/10" : "hover:bg-primary/10"
      }`}
      onClick={handleClick}
    >
      {isListening ? (
        <Mic className="h-4 w-4 text-primary animate-pulse" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      {isListening ? "Listening..." : "Ask Agent"}
    </Button>
  );
};