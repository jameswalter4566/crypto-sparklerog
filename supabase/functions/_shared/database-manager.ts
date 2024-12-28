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
    mint: string;
    name: string;
    symbol: string;
    description?: string;
    image_uri?: string;
    price?: number;
    price_change_24h?: number;
    market_cap?: number;
    volume_24h?: number;
    virtual_sol_reserves?: number;
    total_supply?: number;
  }) {
    try {
      console.log('Processing coin data for upsert:', coinData);
      
      const { error } = await this.supabase
        .from('coins')
        .upsert({
          id: coinData.mint,
          name: coinData.name,
          symbol: coinData.symbol,
          description: coinData.description,
          image_url: coinData.image_uri,
          price: coinData.price,
          change_24h: coinData.price_change_24h,
          market_cap: coinData.market_cap,
          volume_24h: coinData.volume_24h,
          liquidity: coinData.virtual_sol_reserves,
          total_supply: coinData.total_supply,
          solana_addr: coinData.mint,
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