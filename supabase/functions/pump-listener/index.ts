import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { WebSocketManager } from "../_shared/websocket-manager.ts";
import { DatabaseManager } from "../_shared/database-manager.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PUMP_GRAPHQL_WS_URL = "wss://prod.realtime.pump.fun/graphql/realtime";
const API_KEY = "da2-xolgs5smfnfqtbevb3o2uo2rpi";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const db = new DatabaseManager();
    
    const wsManager = new WebSocketManager(
      PUMP_GRAPHQL_WS_URL,
      ['graphql-ws'],
      async (data) => {
        console.log('Processing WebSocket message:', data);
        
        if (data.type === 'data' && data.payload?.data?.newCoinCreated) {
          const newCoin = data.payload.data.newCoinCreated;
          console.log('New coin listing detected:', newCoin);
          
          try {
            await db.upsertCoin({
              id: newCoin.mint,
              name: newCoin.name,
              symbol: newCoin.symbol,
              description: newCoin.description,
              image_url: newCoin.image_uri,
              price: newCoin.price,
              change_24h: newCoin.price_change_24h,
              market_cap: newCoin.market_cap,
              volume_24h: newCoin.volume_24h,
              liquidity: newCoin.virtual_sol_reserves,
              total_supply: newCoin.total_supply,
              solana_addr: newCoin.mint,
              updated_at: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error processing new coin:', error);
          }
        }
      },
      {
        'x-api-key': API_KEY
      }
    );
    
    wsManager.connect();
    
    // Create a transform stream for SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Send status updates every 30 seconds
    const statusInterval = setInterval(async () => {
      const status = wsManager.isConnected();
      try {
        await writer.write(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              status: 'connected',
              wsStatus: status,
              timestamp: new Date().toISOString()
            })}\n\n`
          )
        );
      } catch (error) {
        console.error('Error writing status:', error);
        clearInterval(statusInterval);
      }
    }, 30000);

    // Clean up on client disconnect
    req.signal.addEventListener('abort', () => {
      console.log('Client disconnected, cleaning up...');
      clearInterval(statusInterval);
      wsManager.disconnect();
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in serve handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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