export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const validateSolanaAddress = (address: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

export const createErrorResponse = (
  message: string,
  details: any = {},
  status = 400
): Response => {
  console.error('Error:', message, details);
  
  return new Response(
    JSON.stringify({
      error: message,
      details,
      success: false
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};