import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export class DatabaseManager {
  private supabase;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );
  }

  async updateCoinData(update: {
    id: string;
    price: number;
    change_24h: number;
    market_cap: number;
    volume_24h: number;
    liquidity: number;
  }) {
    try {
      console.log('Processing update for coin:', update.id);
      
      const { error } = await this.supabase
        .from('coins')
        .upsert({
          id: update.id,
          price: update.price,
          change_24h: update.change_24h,
          market_cap: update.market_cap,
          volume_24h: update.volume_24h,
          liquidity: update.liquidity,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating coin data:', error);
      } else {
        console.log('Successfully updated coin:', update.id);
      }
    } catch (error) {
      console.error('Error in updateCoinData:', error);
    }
  }
}