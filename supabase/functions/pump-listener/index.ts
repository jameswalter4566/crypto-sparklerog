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
        console.log('Received WebSocket message:', data);
        
        if (data.type === 'connection_ack') {
          console.log('Connection acknowledged');
        }
        
        if (data.type === 'data' && data.payload?.data?.newListing) {
          const newCoin = data.payload.data.newListing;
          console.log('New coin listing detected:', newCoin);
          
          try {
            await db.upsertCoin(newCoin);
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