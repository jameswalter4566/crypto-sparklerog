import { cn } from "@/lib/utils";

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
  return (
    <div className={cn(
      "bg-background flex flex-col",
      isPreview ? "h-full" : "fixed inset-0 z-50 pt-28" // Added pt-28 for header spacing
    )}>
      {header}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="flex-1 flex flex-col min-h-0 md:max-w-[75%]">
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
          <div className="md:w-[25%] border-t md:border-t-0 md:border-l border-border">
            {chat}
          </div>
        )}
      </div>
    </div>
  );
}