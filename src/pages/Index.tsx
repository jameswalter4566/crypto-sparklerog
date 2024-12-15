import { Card, CardContent } from "@/components/ui/card";
import NewCoinCard from "@/components/NewCoinCard";

const Index = () => {
  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <NewCoinCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;