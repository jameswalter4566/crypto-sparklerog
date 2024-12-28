import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' wss://*.pump.fun https://*.pump.fun wss://*.helius-rpc.com;",
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

const PUMP_API_WS_URL = "wss://frontend-api-v2.pump.fun/socket.io/?EIO=4&transport=websocket";
const HELIUS_WS_URL = "wss://pump-fe.helius-rpc.com/?api-key=1b8db865-a5a1-4535-9aec-01061440523b";
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

class WebSocketManager {
  private supabase;
  private pumpWs: WebSocket | null = null;
  private heliusWs: WebSocket | null = null;
  private reconnectAttempts = 0;

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

  async updateCoinData(update: CoinUpdate) {
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

  setupPumpWebSocket() {
    try {
      console.log('Connecting to Pump.fun WebSocket...');
      this.pumpWs = new WebSocket(PUMP_API_WS_URL);

      this.pumpWs.onopen = () => {
        console.log('Pump.fun WebSocket connection established');
        this.reconnectAttempts = 0;
        
        // Join the price updates channel
        this.pumpWs?.send(JSON.stringify({
          "topic": "price_updates:*",
          "event": "phx_join",
          "payload": {},
          "ref": 0
        }));
      };

      this.pumpWs.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received Pump.fun message:', data);

          if (data.event === "price_update") {
            await this.updateCoinData(data.payload);
          }
        } catch (error) {
          console.error('Error processing Pump.fun message:', error);
        }
      };

      this.pumpWs.onerror = (error) => {
        console.error('Pump.fun WebSocket error:', error);
      };

      this.pumpWs.onclose = () => {
        console.log('Pump.fun WebSocket connection closed');
        this.handleReconnect('pump');
      };
    } catch (error) {
      console.error('Error in setupPumpWebSocket:', error);
    }
  }

  setupHeliusWebSocket() {
    try {
      console.log('Connecting to Helius WebSocket...');
      this.heliusWs = new WebSocket(HELIUS_WS_URL);

      this.heliusWs.onopen = () => {
        console.log('Helius WebSocket connection established');
        this.reconnectAttempts = 0;
      };

      this.heliusWs.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received Helius message:', data);
          
          // Process Helius-specific updates here
          if (data.type === "update") {
            await this.updateCoinData(data.payload);
          }
        } catch (error) {
          console.error('Error processing Helius message:', error);
        }
      };

      this.heliusWs.onerror = (error) => {
        console.error('Helius WebSocket error:', error);
      };

      this.heliusWs.onclose = () => {
        console.log('Helius WebSocket connection closed');
        this.handleReconnect('helius');
      };
    } catch (error) {
      console.error('Error in setupHeliusWebSocket:', error);
    }
  }

  private handleReconnect(type: 'pump' | 'helius') {
    if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect ${type} WebSocket (attempt ${this.reconnectAttempts})...`);
      
      setTimeout(() => {
        if (type === 'pump') {
          this.setupPumpWebSocket();
        } else {
          this.setupHeliusWebSocket();
        }
      }, RECONNECT_INTERVAL);
    } else {
      console.error(`Max reconnection attempts reached for ${type} WebSocket`);
    }
  }

  async initialize() {
    this.setupPumpWebSocket();
    this.setupHeliusWebSocket();
  }

  isConnected() {
    return {
      pump: this.pumpWs?.readyState === WebSocket.OPEN,
      helius: this.heliusWs?.readyState === WebSocket.OPEN
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const wsManager = new WebSocketManager();
    await wsManager.initialize();
    
    // Use TransformStream to keep the function alive
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Keep the connection alive with periodic status updates
    setInterval(() => {
      const status = wsManager.isConnected();
      writer.write(new TextEncoder().encode(JSON.stringify({
        status: 'connected',
        connections: status,
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
