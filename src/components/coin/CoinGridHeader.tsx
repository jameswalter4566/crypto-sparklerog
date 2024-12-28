import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CoinGridHeaderProps {
  title: string;
  onSort: (order: 'asc' | 'desc') => void;
}

export function CoinGridHeader({ title, onSort }: CoinGridHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      <h2 className="text-lg sm:text-xl font-bold animate-text-glow">
        {title}
      </h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
            <ArrowUpDown className="h-4 w-4 sm:h-5 sm:w-5" />
            Sort by Market Cap
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSort('desc')}>
            Highest to Lowest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort('asc')}>
            Lowest to Highest
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}