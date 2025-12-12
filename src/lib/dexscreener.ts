/**
 * DexScreener API integration for fetching Solana token prices
 * Free API, no key required
 */

const DEXSCREENER_API_URL = 'https://api.dexscreener.com/latest/dex';

export interface DexScreenerTokenData {
  priceUsd: number;
  priceNative: number; // Price in SOL
  marketCap: number;
  fdv: number; // Fully Diluted Valuation
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
  name?: string;
  symbol?: string;
  dexId?: string;
  pairAddress?: string;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns?: {
    h24?: { buys: number; sells: number };
  };
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  priceChange?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
}

interface DexScreenerResponse {
  schemaVersion?: string;
  pairs?: DexScreenerPair[];
}

/**
 * Get token price and market data from DexScreener
 */
export async function getTokenPriceFromDexScreener(
  mintAddress: string
): Promise<DexScreenerTokenData | null> {
  try {
    const response = await fetch(`${DEXSCREENER_API_URL}/tokens/${mintAddress}`);

    if (!response.ok) {
      console.warn('DexScreener API error:', response.status, response.statusText);
      return null;
    }

    const data: DexScreenerResponse = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      console.log('No pairs found on DexScreener for:', mintAddress);
      return null;
    }

    // Get the most liquid pair (first one is usually the most relevant)
    const pair = data.pairs[0];
    
    const priceUsd = parseFloat(pair.priceUsd) || 0;
    const priceNative = parseFloat(pair.priceNative) || 0;
    
    return {
      priceUsd,
      priceNative,
      marketCap: pair.marketCap || pair.fdv || 0,
      fdv: pair.fdv || 0,
      volume24h: pair.volume?.h24 || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      name: pair.baseToken?.name,
      symbol: pair.baseToken?.symbol,
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
    };
  } catch (error) {
    console.error('Error fetching from DexScreener:', error);
    return null;
  }
}

/**
 * Get token holder count from Solscan
 */
export async function getTokenHolders(mintAddress: string): Promise<number | null> {
  try {
    // Try Solscan public API
    const response = await fetch(`https://api.solscan.io/token/holders?token=${mintAddress}&offset=0&size=1`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.data?.total) {
        return data.data.total;
      }
    }
    
    // Fallback: try alternative endpoint
    const altResponse = await fetch(`https://public-api.solscan.io/token/meta?tokenAddress=${mintAddress}`);
    if (altResponse.ok) {
      const altData = await altResponse.json();
      if (altData.holder) {
        return altData.holder;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error fetching holder count:', error);
    return null;
  }
}

/**
 * Get prices for multiple tokens
 * DexScreener allows comma-separated addresses (up to 30)
 */
export async function getMultipleTokenPricesFromDexScreener(
  mintAddresses: string[]
): Promise<Map<string, DexScreenerTokenData>> {
  const results = new Map<string, DexScreenerTokenData>();

  if (mintAddresses.length === 0) {
    return results;
  }

  try {
    // DexScreener allows up to 30 addresses per request
    const chunks: string[][] = [];
    for (let i = 0; i < mintAddresses.length; i += 30) {
      chunks.push(mintAddresses.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      const addressList = chunk.join(',');
      const response = await fetch(`${DEXSCREENER_API_URL}/tokens/${addressList}`);

      if (!response.ok) {
        console.warn('DexScreener batch API error:', response.status);
        continue;
      }

      const data: DexScreenerResponse = await response.json();

      if (!data.pairs) {
        continue;
      }

      // Group pairs by base token address
      const pairsByToken = new Map<string, DexScreenerPair>();
      for (const pair of data.pairs) {
        const tokenAddress = pair.baseToken?.address;
        if (tokenAddress && !pairsByToken.has(tokenAddress)) {
          pairsByToken.set(tokenAddress, pair);
        }
      }

      // Convert to our format
      for (const [address, pair] of pairsByToken) {
        const priceUsd = parseFloat(pair.priceUsd) || 0;
        const priceNative = parseFloat(pair.priceNative) || 0;

        results.set(address, {
          priceUsd,
          priceNative,
          marketCap: pair.marketCap || pair.fdv || 0,
          fdv: pair.fdv || 0,
          volume24h: pair.volume?.h24 || 0,
          priceChange24h: pair.priceChange?.h24 || 0,
          liquidity: pair.liquidity?.usd || 0,
          name: pair.baseToken?.name,
          symbol: pair.baseToken?.symbol,
          dexId: pair.dexId,
          pairAddress: pair.pairAddress,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching multiple prices from DexScreener:', error);
    return results;
  }
}

