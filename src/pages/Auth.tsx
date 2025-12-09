import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Try logging in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! You can now start creating monsters.');
          navigate('/');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-pattern opacity-50" />
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-3 h-3 rounded-full bg-primary/40 animate-float" />
      <div className="absolute bottom-40 right-32 w-4 h-4 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-type-electric/40 animate-float" style={{ animationDelay: '0.5s' }} />
      
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <img 
              src={logo} 
              alt="PokeLaunch" 
              className="w-16 h-16 group-hover:animate-pulse-glow transition-all rounded-xl" 
            />
            <div className="text-left">
              <h1 className="font-display font-bold text-3xl text-foreground">
                Poke<span className="text-primary">Launch</span>
              </h1>
              <p className="text-sm text-neon-cyan font-medium">Monster Token Launchpad</p>
            </div>
          </Link>
          
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Revolution'}
          </h2>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Sign in to manage your monsters' 
              : 'Create your account and start launching'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pokedex-panel p-8 space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="MonsterMaster"
                  className="pl-11 py-6 rounded-xl bg-muted/50 border-border focus:border-primary"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@pokelaunch.app"
                className="pl-11 py-6 rounded-xl bg-muted/50 border-border focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11 py-6 rounded-xl bg-muted/50 border-border focus:border-primary"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full btn-pokemon py-6 text-lg mt-6"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Please wait...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {isLogin ? 'Sign In' : 'Create Account'}
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent hover:text-accent/80 font-medium transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}