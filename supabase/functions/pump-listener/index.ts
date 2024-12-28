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
const API_KEY = "da2-xolgs5smfnfqtbevb3o2uo2rpi"; // This is a public API key used by pump.fun frontend

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const db = new DatabaseManager();
    
    // Create WebSocket connection to Pump.fun
    const wsManager = new WebSocketManager(
      PUMP_GRAPHQL_WS_URL,
      ['graphql-ws'],
      async (data) => {
        if (data.type === 'data' && data.payload?.data?.priceUpdate) {
          const update = data.payload.data.priceUpdate;
          await db.updateCoinData({
            id: update.mint,
            price: update.price,
            change_24h: update.change24h,
            market_cap: update.marketCap,
            volume_24h: update.volume24h,
            liquidity: 0 // Not provided in the GraphQL subscription
          });
        }
      },
      {
        'x-api-key': API_KEY
      }
    );
    
    wsManager.connect();
    
    // Use TransformStream to keep the function alive
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Keep the connection alive with periodic status updates
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
