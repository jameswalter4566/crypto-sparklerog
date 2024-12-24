import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadialBar, RadialBarChart } from 'recharts';

interface RugAnalysisProps {
  rugAnalysis: {
    devAnalysis: string;
    launchAnalysis: string;
    socialMediaStatus: string;
    rugScore: number | null;
  };
}

export const RugAnalysis = ({ rugAnalysis }: RugAnalysisProps) => {
  const rugData = [
    {
      name: 'Rug Score',
      value: rugAnalysis.rugScore || 0,
      fill: '#ea384c'
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-primary/10"
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          RUG Analysis
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] bg-card p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">Dev Holdings</h3>
            <p className="text-[#ea384c] font-semibold">
              {rugAnalysis.devAnalysis}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {rugAnalysis.launchAnalysis}
            </p>
            <p className="text-sm text-muted-foreground">
              {rugAnalysis.socialMediaStatus}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div style={{ width: 100, height: 100 }}>
              <RadialBarChart 
                width={100} 
                height={100}
                innerRadius="60%"
                outerRadius="100%"
                data={rugData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="value"
                />
              </RadialBarChart>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">RUG SCORE</p>
              <p className="text-2xl font-bold text-[#ea384c]">???%</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};