import { createClient } from '@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient as createWSClient } from 'npm:graphql-ws';
import WebSocket from 'npm:isomorphic-ws';

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PUMP_FUN_WS_URL = 'wss://prod.realtime.pump.fun/graphql/realtime';

// GraphQL subscription query
const SUBSCRIPTION_QUERY = `
  subscription {
    newCoinCreated {
      mint
      name
      symbol
      price
      marketCap
      volume24h
      change24h
    }
  }
`;

async function startPumpListener() {
  console.log('Starting Pump.fun listener...');

  const wsClient = createWSClient({
    url: PUMP_FUN_WS_URL,
    webSocketImpl: WebSocket,
    connectionParams: {
      // Add any required auth headers here
    },
  });

  return new Promise((resolve, reject) => {
    try {
      const unsubscribe = wsClient.subscribe(
        {
          query: SUBSCRIPTION_QUERY,
        },
        {
          next: async (data) => {
            console.log('Received new coin data:', data);
            
            if (data.data?.newCoinCreated) {
              const coin = data.data.newCoinCreated;
              
              // Insert or update coin in Supabase
              const { error } = await supabase
                .from('coins')
                .upsert({
                  id: coin.mint,
                  name: coin.name,
                  symbol: coin.symbol,
                  price: coin.price,
                  market_cap: coin.marketCap,
                  volume_24h: coin.volume24h,
                  change_24h: coin.change24h,
                  solana_addr: coin.mint,
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'id'
                });

              if (error) {
                console.error('Error upserting coin:', error);
              }
            }
          },
          error: (err) => {
            console.error('Subscription error:', err);
            reject(err);
          },
          complete: () => {
            console.log('Subscription complete');
            resolve(null);
          },
        },
      );

      // Keep the connection alive
      return () => {
        console.log('Cleaning up subscription...');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error in startPumpListener:', error);
      reject(error);
    }
  });
}

serve(async () => {
  try {
    await startPumpListener();
    return new Response('Pump.fun listener started successfully', { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return new Response('Error starting Pump.fun listener', { status: 500 });
  }
});
