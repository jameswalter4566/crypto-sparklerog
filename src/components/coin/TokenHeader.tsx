import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TokenActions } from "./TokenActions";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, RefreshCw, MessageCircle, Twitter } from "lucide-react";
import { CopyAddressButton } from "./CopyAddressButton";

interface TokenHeaderProps {
  name: string;
  symbol: string;
  image: string | null;
  price: number | null;
  description: string | null;
  tokenStandard: string | null;
  decimals: number | undefined;
  updatedAt: string;
  onRefresh: () => void;
  refreshing: boolean;
  solanaAddr?: string;
  twitterHandle?: string | null;
  telegramUrl?: string | null;
  websiteUrl?: string | null;
}

export const TokenHeader = ({
  name,
  symbol,
  image,
  price,
  description,
  tokenStandard,
  decimals,
  updatedAt,
  onRefresh,
  refreshing,
  solanaAddr,
  twitterHandle,
  telegramUrl,
  websiteUrl,
}: TokenHeaderProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to ensure valid URLs
  const ensureValidUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      // Remove any trailing colons and ensure proper protocol
      const cleanUrl = url.replace(/:+$/, '').trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        return `https://${cleanUrl}`;
      }
      return cleanUrl;
    } catch (e) {
      console.error('Invalid URL:', url, e);
      return null;
    }
  };

  const twitterUrl = twitterHandle ? `https://twitter.com/${twitterHandle.replace('@', '')}` : null;
  const validTelegramUrl = ensureValidUrl(telegramUrl);
  const validWebsiteUrl = ensureValidUrl(websiteUrl);

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-border">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={image || ""} alt={name} />
          <AvatarFallback>{symbol[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{name}</h1>
            <span className="text-sm text-muted-foreground">({symbol})</span>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <TokenActions symbol={symbol} solanaAddr={solanaAddr} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {solanaAddr && <CopyAddressButton solanaAddr={solanaAddr} />}
        
        <TooltipProvider>
          <div className="flex items-center gap-2">
            {twitterUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Twitter</p>
                </TooltipContent>
              </Tooltip>
            )}

            {validTelegramUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={validTelegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Telegram</p>
                </TooltipContent>
              </Tooltip>
            )}

            {validWebsiteUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={validWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Website</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        <div className="flex items-center gap-2 ml-auto">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Updated: {formatDate(updatedAt)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={`ml-2 ${refreshing ? "animate-spin" : ""}`}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {tokenStandard && (
          <div>
            <span className="font-medium">Token Standard:</span> {tokenStandard}
          </div>
        )}
        {decimals !== undefined && (
          <div>
            <span className="font-medium">Decimals:</span> {decimals}
          </div>
        )}
      </div>
    </div>
  );
};