import { useEffect, useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HeliusWebSocketOptions {
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
}

const TOKEN_PROGRAM_IDS = [
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token Program
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Program
];

export const useHeliusWebSocket = (options: HeliusWebSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const connectWebSocket = async () => {
      try {
        if (isConnecting) return;
        setIsConnecting(true);

        // Get the API key from Supabase secrets with detailed logging
        console.log('Fetching Helius API key from Supabase...');
        const { data: secretData, error: secretError } = await supabase
          .rpc('get_secret', { secret_name: 'HELIUSKEYMAIN' });

        if (secretError) {
          console.error('Failed to get Helius API key:', secretError);
          toast({
            title: "Configuration Error",
            description: "Failed to get Helius API key. Error: " + secretError.message,
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }

        // Log the structure of the response (safely)
        console.log('Secret response structure:', {
          hasData: !!secretData,
          type: typeof secretData,
          isArray: Array.isArray(secretData)
        });

        if (!secretData || !Array.isArray(secretData) || secretData.length === 0) {
          console.error('Invalid secret data format returned from Supabase');
          toast({
            title: "Configuration Error",
            description: "Invalid secret data format returned from Supabase",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }

        const heliusApiKey = secretData[0]?.value; // Changed from .secret to .value
        
        if (!heliusApiKey) {
          console.error('Helius API key is empty or undefined');
          toast({
            title: "Configuration Error",
            description: "Helius API key is empty or undefined",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }

        console.log('Successfully retrieved Helius API key');
        console.log(`Connecting to Helius WebSocket (Key: ${heliusApiKey.slice(0, 4)}...)`);
        
        const ws = new WebSocket(`wss://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connection established');
          setIsConnecting(false);
          
          TOKEN_PROGRAM_IDS.forEach((programId, index) => {
            const subscribeMessage = {
              jsonrpc: "2.0",
              id: index + 1,
              method: "programSubscribe",
              params: [
                programId,
                {
                  encoding: "jsonParsed",
                  commitment: "finalized"
                }
              ]
            };
            console.log('Sending subscription message:', subscribeMessage);
            ws.send(JSON.stringify(subscribeMessage));
          });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            if (data.result !== undefined) {
              console.log('Subscription confirmed:', data);
              return;
            }

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
          setIsConnecting(false);
          toast({
            title: "WebSocket Error",
            description: "Failed to connect to real-time updates",
            variant: "destructive",
          });
        };

        ws.onclose = (event) => {
          console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
          setIsConnecting(false);
          wsRef.current = null;
          
          // Attempt to reconnect after a delay
          setTimeout(connectWebSocket, 5000);
        };

        // Setup ping interval to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ jsonrpc: "2.0", id: "ping", method: "ping" }));
          }
        }, 30000);

        cleanup = () => {
          clearInterval(pingInterval);
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
          wsRef.current = null;
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setIsConnecting(false);
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive",
        });
      }
    };

    connectWebSocket();

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
