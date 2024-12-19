import { useEffect, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

interface HeliusWebSocketOptions {
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
}

// Program IDs for token-related programs on Solana
const TOKEN_PROGRAM_IDS = [
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token Program
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Program
];

export const useHeliusWebSocket = (options: HeliusWebSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        if (!import.meta.env.VITE_HELIUS_API_KEY) {
          console.error('Helius API key not found in environment variables');
          return;
        }

        const ws = new WebSocket(`wss://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connection established');
          
          // Subscribe to multiple program updates
          TOKEN_PROGRAM_IDS.forEach((programId, index) => {
            const subscribeMessage = {
              jsonrpc: "2.0",
              id: index + 1,
              method: "programSubscribe",
              params: [
                programId,
                {
                  encoding: "jsonParsed",
                  commitment: "confirmed"
                }
              ]
            };
            ws.send(JSON.stringify(subscribeMessage));
          });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            // Handle subscription confirmation
            if (data.result !== undefined) {
              console.log('Subscription confirmed:', data);
              return;
            }

            // Handle program update
            if (data.params?.result?.value) {
              options.onMessage?.(data.params.result.value);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          options.onError?.(error);
          toast({
            title: "WebSocket Error",
            description: "Failed to connect to real-time updates",
            variant: "destructive",
          });
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          setTimeout(connectWebSocket, 5000);
        };

        // Set up ping interval to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ jsonrpc: "2.0", id: "ping", method: "ping" }));
          }
        }, 30000);

        return () => {
          clearInterval(pingInterval);
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive",
        });
      }
    };

    const cleanup = connectWebSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, [options.onMessage, options.onError]);

  return {
    sendMessage: (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  };
};