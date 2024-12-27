import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PUMP_FUN_WS_URL = "wss://frontend-ws.pump.fun/socket/websocket";

interface CoinUpdate {
  id: string;
  price: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
  liquidity: number;
}

async function handleWebSocket() {
  try {
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(PUMP_FUN_WS_URL);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(JSON.stringify({
        "topic": "price_updates:*",
        "event": "phx_join",
        "payload": {},
        "ref": 0
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.event === "price_update") {
          const update: CoinUpdate = data.payload;
          console.log('Processing price update for coin:', update.id);

          const { error } = await supabase
            .from('coins')
            .update({
              price: update.price,
              change_24h: update.change_24h,
              market_cap: update.market_cap,
              volume_24h: update.volume_24h,
              liquidity: update.liquidity,
              updated_at: new Date().toISOString()
            })
            .eq('id', update.id);

          if (error) {
            console.error('Error updating coin data:', error);
          } else {
            console.log('Successfully updated coin:', update.id);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Keep the connection alive
    return ws;
  } catch (error) {
    console.error('Error in handleWebSocket:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const ws = await handleWebSocket();
    
    return new Response(
      JSON.stringify({ 
        status: 'connected',
        message: 'WebSocket connection established successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in serve handler:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
