import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartLoading = () => {
  return (
    <Card className="w-full h-[600px] bg-black border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-gray-200">Price Chart</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center h-[500px]">
        <div className="space-y-4 w-full">
          <Skeleton className="h-4 w-3/4 bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
          <Skeleton className="h-[300px] w-full bg-gray-800" />
        </div>
      </CardContent>
    </Card>
  );
};