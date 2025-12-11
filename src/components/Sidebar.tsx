import { NavLink } from '@/components/NavLink';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { 
  Home, 
  PlusCircle, 
  Download, 
  Layout, 
  Trophy, 
  Sparkles,
  Wallet,
  Zap,
  Search,
  Crown,
  Swords,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { getWalletBalance, shortenAddress, formatSolBalance, MINIMUM_BALANCE_SOL } from '@/lib/solana';

const navItems = [
  { to: '/', icon: Home, label: 'Home', color: 'hover:text-primary' },
  { to: '/create', icon: Zap, label: 'Create Poke', color: 'hover:text-accent' },
  { to: '/discover', icon: Search, label: 'Discover Pokes', color: 'hover:text-type-water' },
  { to: '/ranking', icon: Crown, label: 'Creator Ranking', color: 'hover:text-legendary-gold' },
  { to: '/templates', icon: Layout, label: 'Templates', color: 'hover:text-type-electric' },
  { to: '/battle', icon: Swords, label: 'PokeBattle', color: 'hover:text-type-shadow', badge: 'Soon' },
];

export function Sidebar() {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        setIsLoadingBalance(true);
        try {
          const bal = await getWalletBalance(connection, publicKey);
          setBalance(bal);
          
          // Show warning if balance is low
          if (bal < MINIMUM_BALANCE_SOL) {
            toast.warning(`Low balance: ${formatSolBalance(bal)} SOL. You need at least ${MINIMUM_BALANCE_SOL} SOL to create tokens.`);
          }
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
    
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  const handleDisconnect = async () => {
    await disconnect();
    toast.success('Wallet disconnected');
  };

  const isLowBalance = balance !== null && balance < MINIMUM_BALANCE_SOL;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="PokeLaunch" 
            className="w-12 h-12 group-hover:animate-pulse-glow transition-all rounded-xl" 
          />
          <div>
            <h1 className="font-display font-bold text-xl text-sidebar-foreground">
              Poke<span className="text-primary">Launch</span>
            </h1>
            <p className="text-[10px] text-neon-cyan font-medium tracking-wide">Poke Token Launchpad</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70',
              'transition-all duration-200 border border-transparent',
              item.color
            )}
            activeClassName="bg-sidebar-accent text-sidebar-foreground border-primary/30"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium flex-1">{item.label}</span>
            {'badge' in item && item.badge && (
              <span className="px-2 py-0.5 rounded-full bg-type-shadow/20 text-type-shadow text-[10px] font-bold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Create Button */}
      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to="/create"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-4 rounded-full',
            'btn-pokemon text-primary-foreground font-bold text-base'
          )}
        >
          <Sparkles className="w-5 h-5" />
          Create Poke
        </NavLink>
      </div>

      {/* Wallet Section */}
      {connected && publicKey && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-3">
            {/* Wallet Info */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-type-shadow/30 flex items-center justify-center border border-primary/20">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-foreground truncate">
                  {shortenAddress(publicKey.toBase58())}
                </p>
                <div className="flex items-center gap-1">
                  {isLoadingBalance ? (
                    <p className="text-[10px] text-muted-foreground">Loading...</p>
                  ) : balance !== null ? (
                    <p className={cn(
                      "text-[10px] font-medium",
                      isLowBalance ? "text-destructive" : "text-neon-cyan"
                    )}>
                      {formatSolBalance(balance)} SOL
                    </p>
                  ) : null}
                  {isLowBalance && (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Low Balance Warning */}
            {isLowBalance && (
              <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-[10px] text-destructive">
                  Need ≥ {MINIMUM_BALANCE_SOL} SOL to create tokens
                </p>
              </div>
            )}
            
            {/* Disconnect Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10"
              onClick={handleDisconnect}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 text-center border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground">
          Powered by <span className="text-accent">Solana</span> & <span className="text-neon-cyan">Pump.fun</span>
        </p>
      </div>
    </aside>
  );
}
