import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Poke } from '@/types/monster';
import { PokemonCard } from './PokemonCard';
import { ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LaunchSuccessModalProps {
  poke?: Poke | null;
  monster?: Poke | null;
  open: boolean;
  onClose: () => void;
}

export function LaunchSuccessModal({ poke, monster, open, onClose }: LaunchSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  
  const item = poke || monster;
  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.pumpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewPoke = () => {
    onClose();
    navigate(`/poke/${item.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl text-foreground">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            Poke Launched!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="animate-float">
            <PokemonCard monster={item} size="md" interactive={false} />
          </div>
          
          <div className="w-full space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Launch URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-primary truncate">
                  {item.pumpUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(item.pumpUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Pump
              </Button>
              <Button
                className="flex-1 btn-glow"
                onClick={handleViewPoke}
              >
                View Poke
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
