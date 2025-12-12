/**
 * Bitquery API integration for fetching Solana token prices
 * Market Cap = Token Price × 1,000,000,000 (standard supply)
 */

const BITQUERY_API_URL = 'https://streaming.bitquery.io/eap';
const TOKEN_SUPPLY = 1_000_000_000; // 1 billion

// SOL mint address for pair matching
const SOL_MINT = 'So11111111111111111111111111111111111111112';

export interface BitqueryTokenPrice {
  priceInSol: number;
  priceInUSD: number;
  marketCap: number;
  name?: string;
  symbol?: string;
  lastTradeTime?: string;
}

interface BitqueryTradeResponse {
  data?: {
    Solana?: {
      DEXTradeByTokens?: Array<{
        Block?: {
          Time?: string;
        };
        Trade?: {
          Currency?: {
            Name?: string;
            Symbol?: string;
            MintAddress?: string;
          };
          PriceInSol?: number;
          PriceInUSD?: number;
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

/**
 * Get token price from Bitquery DEX trades
 */
export async function getTokenPriceFromBitquery(
  mintAddress: string,
  apiKey?: string
): Promise<BitqueryTokenPrice | null> {
  try {
    const query = `
      {
        Solana {
          DEXTradeByTokens(
            orderBy: {descending: Block_Time}
            where: {
              Trade: {
                Currency: {
                  MintAddress: {is: "${mintAddress}"}
                }
                Side: {
                  Currency: {
                    MintAddress: {is: "${SOL_MINT}"}
                  }
                }
              }
            }
            limit: {count: 1}
          ) {
            Block {
              Time
            }
            Trade {
              Currency {
                Name
                Symbol
                MintAddress
              }
              PriceInSol: Price
              PriceInUSD
            }
          }
        }
      }
    `;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(BITQUERY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.warn('Bitquery API error:', response.status, response.statusText);
      return null;
    }

    const result: BitqueryTradeResponse = await response.json();

    if (result.errors && result.errors.length > 0) {
      console.warn('Bitquery GraphQL errors:', result.errors);
      return null;
    }

    const trades = result.data?.Solana?.DEXTradeByTokens;
    if (!trades || trades.length === 0) {
      console.log('No trades found for token:', mintAddress);
      return null;
    }

    const trade = trades[0];
    const priceInUSD = trade.Trade?.PriceInUSD || 0;
    const priceInSol = trade.Trade?.PriceInSol || 0;

    // Calculate market cap: Price × Supply (1 billion)
    const marketCap = priceInUSD * TOKEN_SUPPLY;

    return {
      priceInSol,
      priceInUSD,
      marketCap,
      name: trade.Trade?.Currency?.Name,
      symbol: trade.Trade?.Currency?.Symbol,
      lastTradeTime: trade.Block?.Time,
    };
  } catch (error) {
    console.error('Error fetching price from Bitquery:', error);
    return null;
  }
}

/**
 * Get prices for multiple tokens in a single request
 */
export async function getMultipleTokenPrices(
  mintAddresses: string[],
  apiKey?: string
): Promise<Map<string, BitqueryTokenPrice>> {
  const results = new Map<string, BitqueryTokenPrice>();

  if (mintAddresses.length === 0) {
    return results;
  }

  try {
    const mintAddressesJson = JSON.stringify(mintAddresses);
    
    const query = `
      {
        Solana {
          DEXTradeByTokens(
            orderBy: {descending: Block_Time}
            where: {
              Trade: {
                Currency: {
                  MintAddress: {in: ${mintAddressesJson}}
                }
                Side: {
                  Currency: {
                    MintAddress: {is: "${SOL_MINT}"}
                  }
                }
              }
            }
            limitBy: {by: Trade_Currency_MintAddress, count: 1}
          ) {
            Block {
              Time
            }
            Trade {
              Currency {
                Name
                Symbol
                MintAddress
              }
              PriceInSol: Price
              PriceInUSD
            }
          }
        }
      }
    `;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(BITQUERY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.warn('Bitquery API error:', response.status);
      return results;
    }

    const result: BitqueryTradeResponse = await response.json();

    if (result.errors && result.errors.length > 0) {
      console.warn('Bitquery GraphQL errors:', result.errors);
      return results;
    }

    const trades = result.data?.Solana?.DEXTradeByTokens;
    if (!trades) {
      return results;
    }

    for (const trade of trades) {
      const mintAddress = trade.Trade?.Currency?.MintAddress;
      if (!mintAddress) continue;

      const priceInUSD = trade.Trade?.PriceInUSD || 0;
      const priceInSol = trade.Trade?.PriceInSol || 0;
      const marketCap = priceInUSD * TOKEN_SUPPLY;

      results.set(mintAddress, {
        priceInSol,
        priceInUSD,
        marketCap,
        name: trade.Trade?.Currency?.Name,
        symbol: trade.Trade?.Currency?.Symbol,
        lastTradeTime: trade.Block?.Time,
      });
    }

    return results;
  } catch (error) {
    console.error('Error fetching multiple prices from Bitquery:', error);
    return results;
  }
}

/**
 * Calculate market cap from price
 * @param priceInUSD - Token price in USD
 * @param supply - Token supply (defaults to 1 billion)
 */
export function calculateMarketCap(priceInUSD: number, supply: number = TOKEN_SUPPLY): number {
  return priceInUSD * supply;
}

