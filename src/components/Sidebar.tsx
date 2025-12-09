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
  User
} from 'lucide-react';
import logo from '@/assets/logo.svg';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/create', icon: PlusCircle, label: 'Create Monster' },
  { to: '/import', icon: Download, label: 'Import Stats' },
  { to: '/templates', icon: Layout, label: 'Templates' },
  { to: '/leaderboard', icon: Trophy, label: 'Hall of Launches' },
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
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="PokeLaunch" className="w-10 h-10 group-hover:animate-pulse-glow transition-all" />
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">
              Poke<span className="text-primary">Launch</span>
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Monster Token Launchpad</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            activeClassName="bg-sidebar-accent text-sidebar-foreground"
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
            'flex items-center justify-center gap-2 w-full py-3 rounded-lg',
            'bg-primary text-primary-foreground font-bold',
            'btn-glow transition-all duration-300',
            'hover:brightness-110'
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
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
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
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          Powered by imagination & memes
        </p>
      </div>
    </aside>
  );
}
