import { Card, CardContent } from "@/components/ui/card";
import { NewCoinCard } from "@/components/NewCoinCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {coins?.map((coin) => (
          <Card key={coin.id}>
            <CardContent className="pt-6">
              <NewCoinCard
                id={coin.id}
                name={coin.name}
                symbol={coin.symbol}
                price={coin.price || 0}
                change24h={coin.change_24h || 0}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;