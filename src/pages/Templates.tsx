import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PokemonCard } from '@/components/PokemonCard';
import { TypeSelector } from '@/components/TypeSelector';
import { LaunchSuccessModal } from '@/components/LaunchSuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTemplates, createMonster, generateMonsterImage } from '@/lib/api';
import { Monster, Template, MonsterType, Move, Rarity } from '@/types/monster';
import { Rocket, Layout, Loader2, LogIn, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MonsterType>('Fire');
  const [hp, setHp] = useState(100);
  const [moves, setMoves] = useState<Move[]>([]);
  const [rarity, setRarity] = useState<Rarity>('Common');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [launchedMonster, setLaunchedMonster] = useState<Monster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await fetchTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const handleSelectTemplate = (template: Template) => {
    if (!user) {
      toast.error('Please sign in to use templates');
      navigate('/auth');
      return;
    }
    
    setSelectedTemplate(template);
    setName(template.name);
    setTicker(template.name.toUpperCase().replace(/\s/g, '').slice(0, 4));
    setDescription(`A ${template.rarity.toLowerCase()} ${template.type.toLowerCase()} monster with incredible power.`);
    setType(template.type);
    setHp(template.hp);
    setMoves(template.baseMoves);
    setRarity(template.rarity);
    setImageUrl(template.imageUrl || '');
    setShowLaunchDialog(true);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    toast.info('Generating artwork...');
    
    try {
      const prompt = `${name} - ${description}`;
      const generatedUrl = await generateMonsterImage(prompt, type);
      
      if (generatedUrl) {
        setImageUrl(generatedUrl);
        toast.success('Artwork generated!');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (err) {
      toast.error('Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const previewMonster: Partial<Monster> = {
    name,
    ticker,
    description,
    type,
    hp,
    imageUrl: imageUrl || undefined,
    moves,
    rarity,
    marketCap: 0,
    evolutionStage: 1,
  };

  const handleLaunch = async () => {
    if (!user) {
      toast.error('Please sign in to launch');
      return;
    }
    
    if (!name || !ticker) {
      toast.error('Please enter a name and ticker');
      return;
    }

    setIsLaunching(true);
    
    try {
      const newMonster = await createMonster(user.id, {
        name,
        ticker,
        description,
        type,
        hp,
        imageUrl: imageUrl || '/placeholder.svg',
        moves,
        rarity,
      });
      
      if (newMonster) {
        setLaunchedMonster(newMonster);
        setShowLaunchDialog(false);
        setShowSuccessModal(true);
        toast.success('Monster launched!');
      } else {
        toast.error('Failed to launch monster');
      }
    } catch (err) {
      toast.error('Launch failed');
    } finally {
      setIsLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Template Gallery
            </h1>
          </div>
          <p className="text-muted-foreground">
            Choose from AI-generated monster templates and customize before launch
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="group">
              <PokemonCard
                monster={{
                  name: template.name,
                  type: template.type,
                  hp: template.hp,
                  imageUrl: template.imageUrl,
                  moves: template.baseMoves,
                  rarity: template.rarity,
                  evolutionStage: 1,
                }}
                size="md"
                onClick={() => handleSelectTemplate(template)}
              />
              <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  className="btn-glow"
                  onClick={() => handleSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates available yet.</p>
          </div>
        )}
      </div>

      {/* Launch Dialog */}
      <Dialog open={showLaunchDialog} onOpenChange={setShowLaunchDialog}>
        <DialogContent className="max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground">
              Customize & Launch
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Monster Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticker</Label>
                  <Input
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <TypeSelector value={type} onChange={setType} />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Image
                  </>
                )}
              </Button>

              <Button
                className="w-full btn-glow"
                onClick={handleLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch on Pump
                  </>
                )}
              </Button>
            </div>

            {/* Preview */}
            <div className="flex justify-center items-start">
              <PokemonCard monster={previewMonster} size="lg" interactive={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LaunchSuccessModal
        monster={launchedMonster}
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
