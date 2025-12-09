import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  PlusCircle, 
  Download, 
  Layout, 
  Trophy, 
  Sparkles,
  LogIn,
  LogOut,
  User,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';

const navItems = [
  { to: '/', icon: Home, label: 'Home', color: 'hover:text-primary' },
  { to: '/create', icon: Zap, label: 'Create Monster', color: 'hover:text-accent' },
  { to: '/import', icon: Download, label: 'Import Stats', color: 'hover:text-type-water' },
  { to: '/templates', icon: Layout, label: 'Templates', color: 'hover:text-type-electric' },
  { to: '/leaderboard', icon: Trophy, label: 'Hall of Launches', color: 'hover:text-legendary-gold' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

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
            <p className="text-[10px] text-neon-cyan font-medium tracking-wide">Monster Token Launchpad</p>
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
            <span className="font-medium">{item.label}</span>
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
          Create Monster
        </NavLink>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-type-shadow/30 flex items-center justify-center border border-primary/20">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground">
          Powered by <span className="text-accent">imagination</span> & <span className="text-neon-cyan">memes</span>
        </p>
      </div>
    </aside>
  );
}