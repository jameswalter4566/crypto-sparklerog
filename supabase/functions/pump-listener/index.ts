import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' wss://*.pump.fun https://*.pump.fun;",
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

const PUMP_API_WS_URL = "wss://frontend-api-v2.pump.fun/socket.io/?EIO=4&transport=websocket";
const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

interface CoinUpdate {
  id: string;
  price: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
  liquidity: number;
}

let reconnectAttempts = 0;
let isConnected = false;

async function updateCoinData(supabase: any, update: CoinUpdate) {
  try {
    // Use upsert to handle both new and existing coins
    const { error } = await supabase
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
        onConflict: 'id',
        returning: 'minimal' // Don't return the row to save bandwidth
      });

    if (error) {
      console.error('Error upserting coin data:', error);
      return false;
    }
    
    console.log('Successfully upserted coin:', update.id);
    return true;
  } catch (error) {
    console.error('Error in updateCoinData:', error);
    return false;
  }
}

async function handleWebSocket() {
  try {
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(PUMP_API_WS_URL);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Queue for batching updates
    let updateQueue: CoinUpdate[] = [];
    let processingQueue = false;

    // Process queued updates every second
    const processQueue = async () => {
      if (processingQueue || updateQueue.length === 0) return;
      
      processingQueue = true;
      const updates = [...updateQueue];
      updateQueue = [];

      console.log(`Processing ${updates.length} queued updates`);
      
      for (const update of updates) {
        await updateCoinData(supabase, update);
      }
      
      processingQueue = false;
    };

    const queueInterval = setInterval(processQueue, 1000);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      isConnected = true;
      reconnectAttempts = 0;
      
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
          console.log('Queueing price update for coin:', update.id);
          updateQueue.push(update);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnected = false;
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed, code:', event.code, 'reason:', event.reason);
      isConnected = false;
      clearInterval(queueInterval);

      // Attempt to reconnect if we haven't exceeded max attempts
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(() => handleWebSocket(), RECONNECT_INTERVAL);
      } else {
        console.error('Max reconnection attempts reached. Giving up.');
      }
    };

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
    // Keep the connection alive by not ending the response
    const ws = await handleWebSocket();
    
    // Use TransformStream to keep the connection alive
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Write initial connection message
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(JSON.stringify({
      status: 'connected',
      message: 'WebSocket connection established successfully'
    })));

    return new Response(stream.readable, {
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