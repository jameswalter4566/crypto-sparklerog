import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyAddressButton } from "@/components/coin/CopyAddressButton";
import { VoiceChatCounter } from "@/components/coin/VoiceChatCounter";

interface NewCoinCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  imageUrl?: string;
  mintAddress?: string;
}

export function NewCoinCard({ 
  id, 
  name, 
  symbol, 
  imageUrl,
  mintAddress 
}: NewCoinCardProps) {
  const symbolFallback = symbol ? symbol.slice(0, 2) : "??";

  return (
    <a href={`/coin/${id}`} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="hover:bg-gray-900 transition-colors h-full border-2 border-primary/50 animate-laser-border">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} className="object-cover" />
              <AvatarFallback className="text-xl">{symbolFallback}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 sm:gap-2">
              <CopyAddressButton solanaAddr={mintAddress} />
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col items-center gap-1">
            <CardTitle className="text-sm sm:text-base">
              <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">{name}</span>
            </CardTitle>
            <span className="text-xs sm:text-sm text-gray-400">{symbol}</span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}