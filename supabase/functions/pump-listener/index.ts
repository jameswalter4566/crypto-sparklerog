import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { WebSocketManager } from "../_shared/websocket-manager.ts";
import { DatabaseManager } from "../_shared/database-manager.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' wss://*.pump.fun https://*.pump.fun;",
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

const PUMP_GRAPHQL_WS_URL = "wss://prod.realtime.pump.fun/graphql/realtime";
const API_KEY = "da2-xolgs5smfnfqtbevb3o2uo2rpi";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const db = new DatabaseManager();
    
    const wsManager = new WebSocketManager(
      PUMP_GRAPHQL_WS_URL,
      ['graphql-ws'],
      async (data) => {
        console.log('Received WebSocket message:', data);
        
        if (data.type === 'connection_ack') {
          console.log('Connection acknowledged, subscribing to new listings');
          wsManager.subscribe();
        }
        
        if (data.type === 'data' && data.payload?.data?.newListing) {
          const newCoin = data.payload.data.newListing;
          console.log('New coin listing detected:', newCoin);
          
          try {
            const coinData = {
              id: newCoin.mint,
              name: newCoin.name || 'Unknown Token',
              symbol: newCoin.symbol || 'UNKNOWN',
              image_url: newCoin.image_uri || null,
              price: newCoin.price || null,
              change_24h: newCoin.price_change_24h || null,
              market_cap: newCoin.market_cap || null,
              volume_24h: newCoin.volume_24h || null,
              liquidity: newCoin.virtual_sol_reserves || null,
              solana_addr: newCoin.mint,
              total_supply: newCoin.total_supply || null,
              description: newCoin.description || null,
              updated_at: new Date().toISOString()
            };

            const { data: insertedCoin, error } = await db.supabase
              .from('coins')
              .upsert(coinData, {
                onConflict: 'id'
              })
              .select()
              .single();

            if (error) {
              console.error('Error inserting new coin:', error);
            } else {
              console.log('Successfully added new coin:', insertedCoin);
            }
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
    
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    setInterval(() => {
      const status = wsManager.isConnected();
      writer.write(new TextEncoder().encode(JSON.stringify({
        status: 'connected',
        wsStatus: status,
        timestamp: new Date().toISOString()
      })));
    }, 30000);

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