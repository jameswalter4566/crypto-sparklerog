import { toast } from 'sonner';

export const fetchPriceQuote = async (tokenAddress: string, amount: string): Promise<number | null> => {
  try {
    const response = await fetch(`/api/fetch-price-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenAddress, amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch price quote');
    }

    const data = await response.json();
    return data.price || null;
  } catch (error) {
    console.error('Error fetching price quote:', error);
    return null;
  }
};

export const executeSwap = async (tokenAddress: string, amount: string, userPublicKey: string) => {
  try {
    const response = await fetch(`/api/execute-swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress,
        amount,
        userPublicKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to execute swap');
    }

    const data = await response.json();
    if (!data || !data.swapTransaction) {
      throw new Error('Invalid swap response received');
    }

    return data;
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error;
  }
};

export const executeSell = async (tokenAddress: string, amount: string, userPublicKey: string) => {
  try {
    const response = await fetch(`/api/execute-sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress,
        amount,
        userPublicKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to execute sell');
    }

    const data = await response.json();
    if (!data || !data.swapTransaction) {
      throw new Error('Invalid sell response received');
    }

    return data;
  } catch (error) {
    console.error('Error executing sell:', error);
    throw error;
  }
};