export const fetchTokenData = async (context: { queryKey: string[] }) => {
  const [_, address] = context.queryKey;
  
  if (!address) {
    throw new Error('Address is required');
  }

  const response = await fetch(`/api/fetch-prices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token data');
  }

  return response.json();
};