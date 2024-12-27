import { Badge } from "@/components/ui/badge";

interface SearchCountBadgeProps {
  count: number;
}

export const SearchCountBadge = ({ count }: SearchCountBadgeProps) => {
  if (count <= 0) return null;
  
  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col items-center">
      <Badge 
        variant="secondary" 
        className="text-[12.5px] px-2 py-1 bg-yellow-500/90 hover:bg-yellow-500/90 text-black font-semibold"
      >
        {count}
      </Badge>
      <span className="text-[9.5px] text-yellow-500/90 mt-0.5 font-medium">Searches</span>
    </div>
  );
};