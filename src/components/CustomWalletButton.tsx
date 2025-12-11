import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from './ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomWalletButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function CustomWalletButton({ className, size = 'default' }: CustomWalletButtonProps) {
  const { publicKey, disconnect, connected, select, wallets, connect } = useWallet();

  const handleClick = async () => {
    if (connected) {
      disconnect();
    } else {
      // Find Phantom wallet and connect directly
      const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
      if (phantomWallet) {
        select(phantomWallet.adapter.name);
        // The wallet adapter will automatically try to connect after selection
      }
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        'btn-pokemon font-display uppercase',
        size === 'sm' && 'h-10 px-4 text-[0.6rem]',
        size === 'lg' && 'h-14 px-8 text-[0.7rem]',
        className
      )}
    >
      {connected ? (
        <>
          <Wallet className={cn('mr-2', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
          {shortenAddress(publicKey!.toString())}
          <LogOut className={cn('ml-2', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
        </>
      ) : (
        <>
          <Wallet className={cn('mr-2', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
          Connect Wallet
        </>
      )}
    </Button>
  );
}

