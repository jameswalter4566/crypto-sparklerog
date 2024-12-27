import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PUMP_FUN_WS_URL = 'wss://prod.realtime.pump.fun/graphql/realtime?header=<your base64 header>&payload=e30=';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handleWebSocket() {
  try {
    const ws = new WebSocket(PUMP_FUN_WS_URL, ['graphql-ws']);

    ws.onopen = () => {
      console.log('Connected to Pump.fun WebSocket');
      
      // Send connection init message
      ws.send(JSON.stringify({
        type: 'connection_init',
        payload: {
          // Add any required auth tokens here
        }
      }));

      // Send subscription message
      ws.send(JSON.stringify({
        id: '1',
        type: 'subscribe',
        payload: {
          query: `
            subscription {
              newCoinCreated {
                mint
                name
                symbol
              }
            }
          `
        }
      }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'next' && data.payload.data?.newCoinCreated) {
        const coin = data.payload.data.newCoinCreated;
        console.log('New coin created:', coin);
        
        // Store the new coin in Supabase
        const { error } = await supabase
          .from('coins')
          .upsert({
            id: coin.mint,
            name: coin.name,
            symbol: coin.symbol,
            solana_addr: coin.mint,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error storing coin:', error);
        } else {
          console.log('Successfully stored coin:', coin.name);
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

  } catch (error) {
    console.error('Error in handleWebSocket:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  await handleWebSocket();
  return new Response(
    JSON.stringify({ message: 'Pump.fun listener started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});