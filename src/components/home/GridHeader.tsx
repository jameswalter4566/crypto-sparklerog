import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface GridHeaderProps {
  onFilter: () => void;
}

export const GridHeader = ({ onFilter }: GridHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
      <h2 className="text-base sm:text-lg font-bold animate-text-glow">
        Trending Coins
      </h2>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
        onClick={onFilter}
      >
        <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
        Filter
      </Button>
    </div>
  );
};