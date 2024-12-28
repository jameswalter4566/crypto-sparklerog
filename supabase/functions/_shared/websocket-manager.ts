export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly RECONNECT_INTERVAL = 3000;
  private backoffInterval = 1000;
  private heartbeatInterval: number | null = null;

  constructor(
    private readonly url: string,
    private readonly protocols: string[],
    private readonly onMessage: (data: any) => void,
    private readonly headers?: Record<string, string>
  ) {}

  connect() {
    try {
      console.log('Connecting to WebSocket:', this.url);
      this.ws = new WebSocket(this.url, this.protocols);

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.backoffInterval = 1000;
        
        // Send GraphQL connection init message
        this.ws?.send(JSON.stringify({
          type: 'connection_init',
          payload: {
            'x-api-key': this.headers?.['x-api-key']
          }
        }));

        // Start heartbeat
        this.startHeartbeat();

        // Subscribe to new listings with correct field name
        this.ws?.send(JSON.stringify({
          id: '1',
          type: 'start',
          payload: {
            query: `
              subscription NewCoins {
                newCoinCreated {
                  mint
                  name
                  symbol
                  description
                  image_uri
                  price
                  price_change_24h
                  market_cap
                  volume_24h
                  virtual_sol_reserves
                  total_supply
                  created_at
                }
              }
            `
          }
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          switch (data.type) {
            case 'connection_ack':
              console.log('Connection acknowledged');
              break;
            
            case 'ka':
              // Keepalive message, respond if needed
              break;
            
            case 'connection_error':
              console.error('Connection error:', data.payload);
              this.handleReconnect();
              break;
            
            case 'data':
              if (data.payload?.data?.newCoinCreated) {
                console.log('New coin created:', data.payload.data.newCoinCreated);
                this.onMessage(data);
              }
              break;
            
            case 'error':
              console.error('Subscription error:', data.payload);
              break;

            default:
              console.log('Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleReconnect();
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.stopHeartbeat();
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Error in connect:', error);
      this.handleReconnect();
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ws?.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000) as unknown as number;
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect() {
    this.stopHeartbeat();
    
    const backoffDelay = Math.min(this.backoffInterval * Math.pow(2, this.reconnectAttempts), 300000); // Max 5 minutes
    console.log(`Attempting to reconnect in ${backoffDelay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, backoffDelay);
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
