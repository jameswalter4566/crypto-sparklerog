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
        <CardHeader className="p-2 sm:p-3">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} className="object-cover" />
              <AvatarFallback className="text-lg">{symbolFallback}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <CopyAddressButton solanaAddr={mintAddress} />
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="flex flex-col items-center gap-1">
            <CardTitle className="text-xs sm:text-sm md:text-base">
              <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] block">{name}</span>
            </CardTitle>
            <span className="text-xs text-gray-400">{symbol}</span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}