import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, Users, BookOpen, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-3xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            TimeTable Manager
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Système intelligent de génération et gestion d'emplois du temps pour établissements scolaires et universitaires
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              Commencer <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Génération automatique
            </h3>
            <p className="text-muted-foreground">
              Créez des emplois du temps optimisés en quelques clics, respectant toutes les contraintes pédagogiques
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Multi-établissements
            </h3>
            <p className="text-muted-foreground">
              Gérez plusieurs écoles, collèges, lycées ou universités depuis une seule plateforme sécurisée
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Gestion complète
            </h3>
            <p className="text-muted-foreground">
              Emplois du temps réguliers, rattrapages, enseignants, salles et bien plus encore
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
