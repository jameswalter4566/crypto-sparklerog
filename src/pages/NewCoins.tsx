import { useQuery } from "@tanstack/react-query";
import { CoinGrid } from "@/components/CoinGrid";
import { supabase } from "@/integrations/supabase/client";

const NewCoins = () => {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['new-coins'],
    queryFn: async () => {
      console.log('Fetching new coins...');
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching new coins:', error);
        throw error;
      }

      console.log('Fetched new coins:', data);
      return data;
    },
  });

  return (
    <div className="p-4 sm:p-6">
      <CoinGrid coins={coins} isLoading={isLoading} />
    </div>
  );
};

export default NewCoins;