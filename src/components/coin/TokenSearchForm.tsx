import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Search by Mint Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            placeholder="Enter mint address..."
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};