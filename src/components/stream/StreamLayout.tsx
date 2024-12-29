import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreamLayoutProps {
  header: React.ReactNode;
  video: React.ReactNode;
  chat?: React.ReactNode;
  controls?: React.ReactNode;
  isPreview?: boolean;
}

export function StreamLayout({ 
  header, 
  video, 
  chat, 
  controls,
  isPreview = false 
}: StreamLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "bg-background flex flex-col",
      isPreview ? "h-full" : "fixed inset-0 z-50"
    )}>
      {header}
      <div className={cn(
        "flex-1 flex min-h-0",
        isMobile ? "flex-col" : "flex-row"
      )}>
        <div className={cn(
          "flex-1 flex flex-col min-h-0",
          !isMobile && "md:max-w-[75%]"
        )}>
          <div className="flex-1 min-h-0">
            {video}
          </div>
          {controls && (
            <div className="border-t border-border">
              {controls}
            </div>
          )}
        </div>
        {chat && (
          <div className={cn(
            "border-t md:border-t-0 md:border-l border-border",
            isMobile ? "h-[300px]" : "md:w-[25%]"
          )}>
            {chat}
          </div>
        )}
      </div>
    </div>
  );
}