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

  async upsertCoin(coinData: {
    id: string;
    name: string;
    symbol: string;
    description?: string;
    image_url?: string;
    price?: number;
    change_24h?: number;
    market_cap?: number;
    volume_24h?: number;
    liquidity?: number;
    total_supply?: number;
    solana_addr?: string;
    updated_at: string;
  }) {
    try {
      console.log('Processing coin data for upsert:', coinData);
      
      const { error } = await this.supabase
        .from('coins')
        .upsert({
          ...coinData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error upserting coin:', error);
        throw error;
      } else {
        console.log('Successfully upserted coin:', coinData.name);
      }
    } catch (error) {
      console.error('Error in upsertCoin:', error);
      throw error;
    }
  }
}