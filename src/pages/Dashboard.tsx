import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BookOpen, Clock, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      director: 'Directeur',
      teacher: 'Enseignant',
      student: 'Étudiant',
      staff: 'Personnel'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TimeTable Manager</h1>
              <p className="text-xs text-muted-foreground">Gestion des emplois du temps</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role || '')}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bienvenue, {user?.firstName} !
          </h2>
          <p className="text-muted-foreground">
            Accédez rapidement aux fonctionnalités principales de la plateforme
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Emplois du temps</CardTitle>
              <CardDescription>
                Consulter et gérer les plannings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">Enseignants</CardTitle>
              <CardDescription>
                Gérer les enseignants et leurs matières
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Classes & Salles</CardTitle>
              <CardDescription>
                Configuration des ressources
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Rattrapages</CardTitle>
              <CardDescription>
                Planifier les séances de rattrapage
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Statistiques du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cours aujourd'hui</span>
                  <span className="text-2xl font-bold text-primary">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Salles occupées</span>
                  <span className="text-2xl font-bold text-secondary">18/25</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Enseignants actifs</span>
                  <span className="text-2xl font-bold text-accent">42</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-foreground">Nouveau planning disponible</p>
                  <p className="text-xs text-muted-foreground mt-1">Publié il y a 2 heures</p>
                </div>
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-sm font-medium text-foreground">Rattrapage planifié</p>
                  <p className="text-xs text-muted-foreground mt-1">Demain à 14h00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Voir mon emploi du temps
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres du compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
