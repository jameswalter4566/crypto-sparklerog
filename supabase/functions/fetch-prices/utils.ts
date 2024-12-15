export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const validateSolanaAddress = (address: string): boolean => {
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
};

export const createErrorResponse = (error: string, details: any = null, status = 400) => {
  return new Response(
    JSON.stringify({
      error,
      details,
      success: false
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
};