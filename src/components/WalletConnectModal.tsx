import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Sparkles, Shield, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const { select, wallets } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    // Find Phantom wallet
    const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
    if (phantomWallet) {
      select(phantomWallet.adapter.name);
    }
    onOpenChange(false);
  };

  const features = [
    { icon: Zap, text: 'Create unique Poke tokens', color: 'text-primary' },
    { icon: Sparkles, text: 'Launch on Pump.fun', color: 'text-neon-cyan' },
    { icon: Shield, text: 'Secure & decentralized', color: 'text-legendary-gold' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-primary/20 shadow-glow-primary p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-type-shadow/10 to-transparent p-6 pb-4">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-type-shadow flex items-center justify-center shadow-glow-primary">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="font-display text-2xl text-center">
              Connect Wallet
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-sm">
              Connect your Phantom wallet to start creating Pokes
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-5">
          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30">
                <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Connect Button */}
          <Button 
            onClick={handleConnect}
            className="w-full h-12 btn-pokemon text-base font-display"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Phantom
          </Button>

          {/* Footer note */}
          <p className="text-center text-[11px] text-muted-foreground">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
