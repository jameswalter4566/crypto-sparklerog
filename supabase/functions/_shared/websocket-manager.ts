export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 3000;

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
        
        // Send GraphQL connection init message
        this.ws?.send(JSON.stringify({
          type: 'connection_init',
          payload: {}
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          this.onMessage(data);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Error in connect:', error);
    }
  }

  subscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    // Subscribe to new listings
    this.ws.send(JSON.stringify({
      id: '1',
      type: 'subscribe',
      payload: {
        query: `
          subscription NewListings {
            newListing {
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

    console.log('Subscribed to new listings');
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.RECONNECT_INTERVAL);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}