import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Poke } from '@/types/monster';
import { PokemonCard } from './PokemonCard';
import { ExternalLink, Copy, Check, Sparkles, Rocket } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LaunchSuccessModalProps {
  poke?: Poke | null;
  monster?: Poke | null;
  open: boolean;
  onClose: () => void;
}

export function LaunchSuccessModal({ poke, monster, open, onClose }: LaunchSuccessModalProps) {
  const [copiedPump, setCopiedPump] = useState(false);
  const [copiedMint, setCopiedMint] = useState(false);
  const navigate = useNavigate();
  
  const item = poke || monster;
  if (!item) return null;

  const handleCopyPump = () => {
    navigator.clipboard.writeText(item.pumpUrl);
    setCopiedPump(true);
    setTimeout(() => setCopiedPump(false), 2000);
  };

  const handleCopyMint = () => {
    if (item.mintAddress) {
      navigator.clipboard.writeText(item.mintAddress);
      setCopiedMint(true);
      setTimeout(() => setCopiedMint(false), 2000);
    }
  };

  const handleViewPoke = () => {
    onClose();
    navigate(`/poke/${item.id}`);
  };

  const pokelaunchUrl = `${window.location.origin}/poke/${item.id}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl bg-card border-border p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 px-6 py-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-display text-2xl text-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <span className="block">Poke Launched!</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Your token is now live on Pump.fun
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Preview */}
            <div className="flex justify-center">
              <div className="animate-float">
                <PokemonCard monster={item} size="md" interactive={false} />
              </div>
            </div>
            
            {/* Info Panel */}
            <div className="space-y-4">
              {/* Token Name */}
              <div className="text-center md:text-left">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {item.name}
                </h3>
                <p className="text-accent font-mono font-semibold">${item.ticker}</p>
              </div>

              {/* Mint Address */}
              {item.mintAddress && (
                <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Token Address (Mint)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-foreground break-all">
                      {item.mintAddress}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyMint}
                      className="shrink-0 h-8 w-8 p-0"
                    >
                      {copiedMint ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Pump.fun URL */}
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Pump.fun URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-primary break-all">
                    {item.pumpUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPump}
                    className="shrink-0 h-8 w-8 p-0"
                  >
                    {copiedPump ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* PokeLaunch URL */}
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">PokeLaunch URL</p>
                <code className="text-xs font-mono text-accent break-all block">
                  {pokelaunchUrl}
                </code>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(item.pumpUrl, '_blank')}
            >
              <Rocket className="w-4 h-4 mr-2" />
              View on Pump.fun
            </Button>
            <Button
              className="flex-1 btn-glow"
              onClick={handleViewPoke}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Poke Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
