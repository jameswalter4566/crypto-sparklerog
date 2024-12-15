export const fetchJupiterPrices = async () => {
  try {
    const response = await fetch('https://price.jup.ag/v4/price');
    if (!response.ok) {
      throw new Error('Failed to fetch Jupiter prices');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Jupiter prices:', error);
    throw error;
  }
};