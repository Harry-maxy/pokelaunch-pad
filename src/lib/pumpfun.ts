import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { getTokenPriceFromDexScreener, getTokenHolders } from './dexscreener';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface DeployTokenParams {
  metadata: TokenMetadata;
  devBuyAmountSol: number;
  imageFile?: File;
}

export interface DeployTokenResult {
  success: boolean;
  mintAddress?: string;
  pumpUrl?: string;
  signature?: string;
  error?: string;
}

/**
 * Create a new token on pump.fun via PumpPortal API
 * Uses Supabase Edge Function as proxy to avoid CORS
 */
export async function createPumpFunToken(
  connection: Connection,
  wallet: WalletContextState,
  params: DeployTokenParams
): Promise<DeployTokenResult> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const { metadata, devBuyAmountSol } = params;

    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toString();

    console.log('🚀 Creating token with mint:', mintAddress);

    // Step 1: Upload metadata to IPFS via proxy
    let metadataUri = metadata.imageUrl;
    
    try {
      console.log('📤 Uploading metadata to IPFS...');
      
      // Convert image URL to base64 if it's a data URL
      let imageBase64: string | undefined;
      if (metadata.imageUrl && metadata.imageUrl.startsWith('data:')) {
        imageBase64 = metadata.imageUrl;
      }

      const { data: ipfsData, error: ipfsError } = await supabase.functions.invoke('pump-proxy', {
        body: {
          endpoint: 'ipfs',
          body: {
            name: metadata.name,
            symbol: metadata.symbol,
            description: metadata.description,
            twitter: metadata.twitter,
            website: metadata.website,
            imageBase64,
          }
        }
      });

      if (ipfsError) {
        console.warn('⚠️ IPFS upload error:', ipfsError);
      } else if (ipfsData?.metadataUri) {
        metadataUri = ipfsData.metadataUri;
        console.log('✅ IPFS upload success:', metadataUri);
      } else {
        console.warn('⚠️ IPFS upload failed, using direct URL');
      }
    } catch (ipfsErr) {
      console.warn('⚠️ IPFS upload exception:', ipfsErr);
    }

    // Step 2: Get transaction from PumpPortal via proxy
    console.log('📝 Requesting transaction from PumpPortal...');
    
    // Ensure amount is a proper number (PumpPortal requires this)
    const devBuyAmount = Number(devBuyAmountSol) || 0;
    console.log('💰 Dev buy amount:', devBuyAmount, 'SOL');

    const { data: tradeData, error: tradeError } = await supabase.functions.invoke('pump-proxy', {
      body: {
        endpoint: 'trade-local',
        body: {
          publicKey: wallet.publicKey.toString(),
          action: 'create',
          tokenMetadata: {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadataUri,
          },
          mint: mintAddress,
          denominatedInSol: 'true',
          amount: devBuyAmount, // Amount in SOL for dev buy
          slippage: 10,
          priorityFee: 0.0005,
          pool: 'pump',
        }
      }
    });

    if (tradeError) {
      console.error('❌ Trade API error:', tradeError);
      return { 
        success: false, 
        mintAddress,
        pumpUrl: `https://pump.fun/${mintAddress}`,
        error: `Edge Function error: ${tradeError.message}` 
      };
    }

    if (!tradeData?.transaction) {
      console.error('❌ No transaction returned:', tradeData);
      return { 
        success: false, 
        mintAddress,
        pumpUrl: `https://pump.fun/${mintAddress}`,
        error: tradeData?.error || 'No transaction returned from PumpPortal' 
      };
    }

    // Step 3: Decode and sign the transaction
    console.log('✍️ Signing transaction...');
    
    const transactionBytes = Uint8Array.from(atob(tradeData.transaction), c => c.charCodeAt(0));
    const transaction = VersionedTransaction.deserialize(transactionBytes);

    // Sign with the mint keypair first
    transaction.sign([mintKeypair]);

    // Then sign with the user's wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Step 4: Send the transaction
    console.log('📡 Sending transaction to Solana...');
    
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('📨 Transaction sent:', signature);

    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      return { 
        success: false, 
        mintAddress,
        pumpUrl: `https://pump.fun/${mintAddress}`,
        signature,
        error: 'Transaction failed to confirm' 
      };
    }

    console.log('🎉 Token created successfully on pump.fun!');
    
    return {
      success: true,
      mintAddress,
      pumpUrl: `https://pump.fun/${mintAddress}`,
      signature,
    };

  } catch (error) {
    console.error('❌ Error creating pump.fun token:', error);
    
    // Generate a mint address even on failure for local storage
    const fallbackMint = Keypair.generate().publicKey.toString();
    
    return {
      success: false,
      mintAddress: fallbackMint,
      pumpUrl: `https://pump.fun/${fallbackMint}`,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get token info from pump.fun
 */
export interface PumpFunTokenData {
  name: string;
  symbol: string;
  description: string;
  imageUri: string;
  marketCap: number;
  bondingCurve: string;
  totalSupply: number;
  website?: string;
  twitter?: string;
  telegram?: string;
  creator: string;
  createdTimestamp: number;
  raydiumPool?: string;
  complete: boolean;
  virtualSolReserves?: number;
  virtualTokenReserves?: number;
  // Price and market data
  priceUsd?: number;
  volume24h?: number;
  priceChange24h?: number;
  holders?: number;
}

export async function getPumpFunTokenInfo(mintAddress: string): Promise<PumpFunTokenData | null> {
  try {
    // Try pump.fun API first
    const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`);
    
    let pumpData: PumpFunTokenData | null = null;
    
    if (response.ok) {
      const data = await response.json();
      pumpData = {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        imageUri: data.image_uri,
        marketCap: data.usd_market_cap || 0,
        bondingCurve: data.bonding_curve,
        totalSupply: data.total_supply || 1000000000,
        website: data.website,
        twitter: data.twitter,
        telegram: data.telegram,
        creator: data.creator,
        createdTimestamp: data.created_timestamp,
        raydiumPool: data.raydium_pool,
        complete: data.complete || false,
        virtualSolReserves: data.virtual_sol_reserves,
        virtualTokenReserves: data.virtual_token_reserves,
        volume24h: data.volume_24h,
        priceChange24h: data.price_change_24h,
        holders: data.holder_count,
      };
    }

    // Always try DexScreener for latest price data
    console.log('📊 Fetching price from DexScreener...');
    const dexData = await getTokenPriceFromDexScreener(mintAddress);
    
    if (dexData && dexData.priceUsd > 0) {
      console.log('✅ Got price from DexScreener:', dexData.priceUsd, 'MC:', dexData.marketCap);
      
      if (pumpData) {
        // Merge DexScreener data with pump.fun data
        pumpData.priceUsd = dexData.priceUsd;
        pumpData.marketCap = dexData.marketCap || pumpData.marketCap;
        pumpData.volume24h = dexData.volume24h || pumpData.volume24h;
        pumpData.priceChange24h = dexData.priceChange24h || pumpData.priceChange24h;
      } else {
        // Create minimal data from DexScreener
        pumpData = {
          name: dexData.name || '',
          symbol: dexData.symbol || '',
          description: '',
          imageUri: '',
          marketCap: dexData.marketCap,
          bondingCurve: '',
          totalSupply: 1000000000,
          creator: '',
          createdTimestamp: 0,
          complete: false,
          priceUsd: dexData.priceUsd,
          volume24h: dexData.volume24h,
          priceChange24h: dexData.priceChange24h,
        };
      }
    }

    // Try to get holders from Solscan if not available
    if (pumpData && (!pumpData.holders || pumpData.holders === 0)) {
      console.log('📊 Fetching holders from Solscan...');
      const holders = await getTokenHolders(mintAddress);
      if (holders && holders > 0) {
        console.log('✅ Got holders from Solscan:', holders);
        pumpData.holders = holders;
      }
    }

    return pumpData;
  } catch (error) {
    console.error('Error fetching token info:', error);
    
    // Last resort: try DexScreener directly
    try {
      const dexData = await getTokenPriceFromDexScreener(mintAddress);
      if (dexData) {
        const holders = await getTokenHolders(mintAddress);
        return {
          name: dexData.name || '',
          symbol: dexData.symbol || '',
          description: '',
          imageUri: '',
          marketCap: dexData.marketCap,
          bondingCurve: '',
          totalSupply: 1000000000,
          creator: '',
          createdTimestamp: 0,
          complete: false,
          priceUsd: dexData.priceUsd,
          volume24h: dexData.volume24h,
          priceChange24h: dexData.priceChange24h,
          holders: holders || undefined,
        };
      }
    } catch (e) {
      console.error('DexScreener fallback also failed:', e);
    }
    
    return null;
  }
}
