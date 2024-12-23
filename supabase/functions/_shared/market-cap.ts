export function calculateMarketCap(
  coinGeckoMarketCap: number | null | undefined,
  terminalMarketCap: number | null,
  price: number | null,
  circulatingSupply: number | null
): number | null {
  console.log('Calculating market cap with:', {
    coinGeckoMarketCap,
    terminalMarketCap,
    price,
    circulatingSupply
  });

  // Prefer CoinGecko data
  if (typeof coinGeckoMarketCap === 'number' && !isNaN(coinGeckoMarketCap)) {
    console.log('Using CoinGecko market cap:', coinGeckoMarketCap);
    return coinGeckoMarketCap;
  }

  // Use GeckoTerminal data
  if (typeof terminalMarketCap === 'number' && !isNaN(terminalMarketCap)) {
    console.log('Using GeckoTerminal market cap:', terminalMarketCap);
    return terminalMarketCap;
  }

  // Calculate from price and circulating supply
  if (typeof price === 'number' && 
      !isNaN(price) && 
      typeof circulatingSupply === 'number' && 
      !isNaN(circulatingSupply)) {
    const calculated = +(price * circulatingSupply).toFixed(2);
    console.log('Calculated market cap:', calculated);
    return calculated;
  }

  console.log('No valid market cap could be calculated');
  return null;
}