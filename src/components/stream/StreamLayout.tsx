import { cn } from "@/lib/utils";

interface StreamLayoutProps {
  header: React.ReactNode;
  video: React.ReactNode;
  controls?: React.ReactNode;
  isPreview?: boolean;
}

export function StreamLayout({ 
  header, 
  video, 
  controls,
  isPreview = false 
}: StreamLayoutProps) {
  return (
    <div className={cn(
      "bg-background flex flex-col",
      isPreview ? "h-full" : "fixed inset-0 z-50"
    )}>
      {header}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          {video}
        </div>
        {controls && (
          <div className="border-t border-border">
            {controls}
          </div>
        )}
      </div>
    </div>
  );
}