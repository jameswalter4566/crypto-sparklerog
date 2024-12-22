import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TokenSearchFormProps {
  onSearch: (mintAddress: string) => void;
  isLoading: boolean;
}

export const TokenSearchForm = ({ onSearch, isLoading }: TokenSearchFormProps) => {
  const [mintAddress, setMintAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(mintAddress.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-2xl mx-auto">
      <div className="flex-1 animate-laser-border rounded-full">
        <Input
          placeholder="Search by mint address..."
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          className="flex-1 rounded-full bg-card border-primary/20 focus-visible:ring-primary hover:animate-glow-pulse transition-all duration-300 text-sm sm:text-base h-10 sm:h-12"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="rounded-full text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6"
      >
        <Search className="h-4 w-4 mr-2" />
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
};