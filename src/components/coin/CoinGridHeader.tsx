import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface CoinGridHeaderProps {
  title: string;
}

export function CoinGridHeader({ title }: CoinGridHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      <h2 className="text-lg sm:text-xl font-bold animate-text-glow">
        {title}
      </h2>
      <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
        <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
        Filter
      </Button>
    </div>
  );
}