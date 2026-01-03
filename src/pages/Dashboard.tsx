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
import { useDashboardStats, useGeneralStats } from "@/hooks/useStats";
import { useMesCours } from "@/hooks/useCours";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  {
    title: "Mes absences",
    url: "/etudiant/absences",
    icon: UserCog,
    description: "Consultez vos absences",
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
    url: "/gestion/salles",
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
    url: "/gestion/settings",
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
  const { data: generalStats, isLoading: isLoadingGeneral } = useGeneralStats();
  const { data: dashboardStats, isLoading: isLoadingDashboard } = useDashboardStats();

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
              Bienvenue, {user?.firstName} !
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
          {user?.role === 'etudiant' ? (
            // --- CARTES ÉTUDIANT ---
            <>
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cours aujourd'hui
                  </CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.etudiant?.cours_aujourdhui || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Absences (Total)
                  </CardTitle>
                  <UserCog className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.etudiant?.absences_total || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Non Justifiées
                  </CardTitle>
                  <Shield className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.etudiant?.absences_injustifiees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">À régulariser</p>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Classe
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-foreground truncate">
                    {isLoadingDashboard ? '-' : dashboardStats?.etudiant?.classe || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // --- CARTES ADMIN/AUTRE (EXISTANT) ---
            <>
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cours aujourd'hui
                  </CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingGeneral ? '-' : generalStats?.etat?.cours_aujourdhui || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Séances prévues</p>
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
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingGeneral ? '-' : generalStats?.utilisation?.salles_utilisees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium text-green-600">
                    {generalStats?.utilisation?.taux_utilisation_salles || 0}% occupation
                  </p>
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
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.alertes?.rattrapages_urgents || 0}
                  </div>
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
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingGeneral ? '-' : generalStats?.utilisation?.taux_utilisation_salles || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Global établissement</p>
                </CardContent>
              </Card>
            </>
          )}

          {user?.role === 'enseignant' && (
            <>
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cours aujourd'hui
                  </CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.enseignant?.cours_aujourdhui || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Séances prévues</p>
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
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.enseignant?.rattrapages_en_attente || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">À planifier</p>
                </CardContent>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Mes absences
                  </CardTitle>
                  <UserCog className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : dashboardStats?.enseignant?.absences_declarees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Déclarées</p>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Volume horaire
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingDashboard ? '-' : '24h'}
                  </div>
                  <p className="text-xs text-muted-foreground">Hebdomadaire</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions basées sur le rôle */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
          <RoleBasedActions onActionClick={handleActionClick} />
        </div>

        {/* Mes Cours (Enseignant) */}
        {user?.role === 'enseignant' && <TeacherCourseList />}

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
                  onClick={() => navigate('/gestion/settings')}
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
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingGeneral ? "-" : generalStats?.etat?.classes_actives || 0}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Enseignants</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingGeneral ? "-" : generalStats?.general?.total_enseignants || 0}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingGeneral ? "-" : generalStats?.general?.total_utilisateurs || 0}
                  </p>
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

const TeacherCourseList = () => {
  const { cours, isLoading } = useMesCours();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="py-10 text-center text-muted-foreground">
          Chargement de vos cours...
        </CardContent>
      </Card>
    );
  }

  if (!cours || cours.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mes Cours
          </CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center text-muted-foreground">
          <p>Aucun cours ne vous est assigné actuellement.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mes Cours
          </CardTitle>
          <CardDescription>
            Aperçu de vos enseignements en cours
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/enseignant/cours')}>
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cours.slice(0, 3).map((c: any) => {
            const progression = c.heures_total > 0
              ? Math.round((c.heures_effectuees / c.heures_total) * 100)
              : 0;

            return (
              <Card key={c.id} className="bg-muted/30 border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/enseignant/cours')}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.couleur }} />
                      <h4 className="font-semibold text-sm truncate max-w-[150px]">{c.matiere_nom}</h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{c.classe_nom}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progression</span>
                      <span>{c.heures_effectuees}/{c.heures_total}h</span>
                    </div>
                    <Progress value={progression} className="h-1.5" />

                    <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>Prochain: {c.prochainCours || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
