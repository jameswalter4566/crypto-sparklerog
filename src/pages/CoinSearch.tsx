import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CoinSearch = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Search Token
      </h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Demo Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a demo application. Token search functionality is not available in demo mode.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinSearch;