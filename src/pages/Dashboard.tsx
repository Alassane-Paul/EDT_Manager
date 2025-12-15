import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { RoleBasedActions, HasRole } from "@/components/RoleBasedActions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Bell,
  RefreshCw,
  DoorOpen,
  BarChart3,
  Shield,
  Settings,
  UserCog,
  Building2,
  Calendar,
  BookOpen,
  GraduationCap,
  Users
} from "lucide-react";
import { UserRole } from "@/contexts/AuthContext";

interface DashboardPage {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  roles: UserRole[];
  category: string;
}

const dashboardPages: DashboardPage[] = [
  // Étudiant
  { 
    title: "Emploi du temps", 
    url: "/etudiant/emploi-temps", 
    icon: Calendar, 
    description: "Consultez votre emploi du temps",
    roles: ["admin", "etudiant"],
    category: "Étudiant"
  },
  { 
    title: "Mes cours", 
    url: "/etudiant/cours", 
    icon: BookOpen, 
    description: "Liste de vos cours",
    roles: ["admin", "etudiant"],
    category: "Étudiant"
  },
  { 
    title: "Notifications", 
    url: "/etudiant/notifications", 
    icon: Bell, 
    description: "Vos notifications",
    roles: ["admin", "etudiant"],
    category: "Étudiant"
  },
  // Personnel
  { 
    title: "Emplois du temps", 
    url: "/personnel/emplois-temps", 
    icon: Calendar, 
    description: "Gestion des emplois du temps",
    roles: ["admin", "personnel"],
    category: "Personnel"
  },
  { 
    title: "Disponibilité salles", 
    url: "/personnel/salles", 
    icon: DoorOpen, 
    description: "Gérer les salles",
    roles: ["admin", "personnel"],
    category: "Personnel"
  },
  // Enseignant
  { 
    title: "Mon emploi du temps", 
    url: "/enseignant/emploi-temps", 
    icon: Calendar, 
    description: "Votre emploi du temps",
    roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"],
    category: "Enseignant"
  },
  { 
    title: "Mes cours", 
    url: "/enseignant/cours", 
    icon: BookOpen, 
    description: "Vos cours assignés",
    roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"],
    category: "Enseignant"
  },
  { 
    title: "Gestion absences", 
    url: "/enseignant/absences", 
    icon: UserCog, 
    description: "Déclarer les absences",
    roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"],
    category: "Enseignant"
  },
  // Gestion
  { 
    title: "Établissements", 
    url: "/gestion/etablissements", 
    icon: Building2, 
    description: "Gérer les établissements",
    roles: ["admin", "directeur"],
    category: "Gestion"
  },
  { 
    title: "Classes", 
    url: "/gestion/classes", 
    icon: GraduationCap, 
    description: "Gérer les classes",
    roles: ["admin", "directeur", "responsable_pedagogique"],
    category: "Gestion"
  },
  { 
    title: "Enseignants", 
    url: "/gestion/teachers", 
    icon: UserCog, 
    description: "Gérer les enseignants",
    roles: ["admin", "directeur", "responsable_pedagogique"],
    category: "Gestion"
  },
  { 
    title: "Salles", 
    url: "/personnel/salles", 
    icon: DoorOpen, 
    description: "Gérer les salles",
    roles: ["admin", "directeur", "responsable_pedagogique"],
    category: "Gestion"
  },
  { 
    title: "Matières", 
    url: "/gestion/matieres", 
    icon: BookOpen, 
    description: "Gérer les matières",
    roles: ["admin", "directeur", "responsable_pedagogique"],
    category: "Gestion"
  },
  { 
    title: "Rattrapages", 
    url: "/gestion/rattrapages", 
    icon: Calendar, 
    description: "Gérer les rattrapages",
    roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"],
    category: "Gestion"
  },
  // Administration
  { 
    title: "Utilisateurs", 
    url: "/admin/utilisateurs", 
    icon: Users, 
    description: "Gérer les utilisateurs",
    roles: ["admin", "directeur"],
    category: "Administration"
  },
  { 
    title: "Paramètres", 
    url: "/admin/parametres", 
    icon: Settings, 
    description: "Paramètres système",
    roles: ["admin"],
    category: "Administration"
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  const hasAccess = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Grouper les pages par catégorie
  const pagesByCategory = dashboardPages
    .filter(page => hasAccess(page.roles))
    .reduce((acc, page) => {
      if (!acc[page.category]) {
        acc[page.category] = [];
      }
      acc[page.category].push(page);
      return acc;
    }, {} as Record<string, DashboardPage[]>);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Bonjour, {user?.firstName} ! 👋
            </h2>
            <p className="text-muted-foreground mt-1">
              Voici un aperçu de votre tableau de bord
            </p>
          </div>
          
          {/* 2FA Setup Button */}
          {!user?.twoFactorEnabled && (
            <Button 
              variant="outline" 
              onClick={() => setShow2FASetup(true)}
              className="hidden sm:flex items-center gap-2 border-orange-500/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-700"
            >
              <Shield className="h-4 w-4" />
              Activer 2FA
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cours aujourd'hui
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5</div>
              <p className="text-xs text-muted-foreground">+2 par rapport à hier</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Salles disponibles
              </CardTitle>
              <DoorOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">Sur 18 salles</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rattrapages en attente
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground">À planifier</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux d'occupation
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">78%</div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions basées sur le rôle */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
          <RoleBasedActions onActionClick={handleActionClick} />
        </div>

        {/* Pages disponibles organisées par catégorie */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Pages disponibles</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(pagesByCategory).map(([category, pages]) => (
                <Card key={category} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pages.map((page) => {
                      const IconComponent = page.icon;
                      return (
                        <Button
                          key={page.url}
                          variant="ghost"
                          className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
                          onClick={() => navigate(page.url)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <IconComponent className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{page.title}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {page.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Panel - uniquement visible pour les admins */}
        <HasRole roles={['admin']}>
          <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-700 dark:text-red-400">Panel Administrateur</CardTitle>
                  <CardDescription>
                    Accès complet au système
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                  onClick={() => navigate('/admin/utilisateurs')}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Gérer les utilisateurs
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                  onClick={() => navigate('/gestion/etablissements')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Établissements
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                  onClick={() => navigate('/admin/parametres')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres système
                </Button>
              </div>
            </CardContent>
          </Card>
        </HasRole>

        {/* Etablissement Info (for admin/director) */}
        {(user?.role === 'admin' || user?.role === 'directeur') && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Gestion de l'établissement</CardTitle>
                  <CardDescription>
                    Configurez les paramètres de votre établissement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Classes actives</p>
                  <p className="text-2xl font-bold text-foreground">24</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Enseignants</p>
                  <p className="text-2xl font-bold text-foreground">45</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Étudiants</p>
                  <p className="text-2xl font-bold text-foreground">892</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 2FA Setup Dialog */}
      <TwoFactorSetup 
        open={show2FASetup} 
        onOpenChange={setShow2FASetup}
      />
    </AppLayout>
  );
};

export default Dashboard;
