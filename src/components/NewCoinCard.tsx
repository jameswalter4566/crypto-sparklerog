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
      <Card className="hover:bg-gray-900 transition-colors h-full">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-72 lg:w-72 mx-auto">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} className="object-cover" />
              <AvatarFallback className="text-2xl">{symbolFallback}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <CopyAddressButton solanaAddr={mintAddress} />
              <VoiceChatCounter coinId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-1">
            <CardTitle className="text-base sm:text-lg">
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{name}</span>
            </CardTitle>
            <span className="text-sm text-gray-400">{symbol}</span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}