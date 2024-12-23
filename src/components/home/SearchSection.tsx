import { TokenSearchForm } from "@/components/coin/TokenSearchForm";

interface SearchSectionProps {
  onSearch: (mintAddress: string) => void;
  isLoading: boolean;
}

export const SearchSection = ({ onSearch, isLoading }: SearchSectionProps) => {
  return (
    <div className="px-2">
      <TokenSearchForm onSearch={onSearch} isLoading={isLoading} />
    </div>
  );
};