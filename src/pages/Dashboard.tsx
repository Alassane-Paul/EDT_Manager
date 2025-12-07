import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Building2, 
  Clock, 
  Bell,
  LogOut,
  RefreshCw,
  GraduationCap,
  DoorOpen,
  BarChart3,
  Shield
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrateur",
      directeur: "Directeur",
      responsable_pedagogique: "Responsable pédagogique",
      enseignant: "Enseignant",
      etudiant: "Étudiant",
      personnel: "Personnel",
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      directeur: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      responsable_pedagogique: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      enseignant: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      etudiant: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      personnel: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  // Quick actions basées sur le rôle
  const getQuickActions = () => {
    const baseActions = [
      {
        title: "Emplois du temps",
        description: "Consulter et gérer les plannings",
        icon: Calendar,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ];

    if (user?.role === 'admin' || user?.role === 'directeur' || user?.role === 'responsable_pedagogique') {
      return [
        ...baseActions,
        {
          title: "Enseignants",
          description: "Gérer les profils enseignants",
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
          title: "Classes",
          description: "Gérer les classes et groupes",
          icon: GraduationCap,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Salles",
          description: "Gérer les salles de cours",
          icon: DoorOpen,
          color: "text-purple-600",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
        },
        {
          title: "Matières",
          description: "Gérer les matières enseignées",
          icon: BookOpen,
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
        },
        {
          title: "Rattrapages",
          description: "Planifier les séances de rattrapage",
          icon: RefreshCw,
          color: "text-red-600",
          bgColor: "bg-red-100 dark:bg-red-900/30",
        },
      ];
    }

    if (user?.role === 'enseignant') {
      return [
        ...baseActions,
        {
          title: "Mon planning",
          description: "Voir mon emploi du temps",
          icon: Clock,
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
          title: "Mes cours",
          description: "Gérer mes cours",
          icon: BookOpen,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Rattrapages",
          description: "Demander un rattrapage",
          icon: RefreshCw,
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
        },
      ];
    }

    return baseActions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">TimeTable Manager</h1>
                <p className="text-xs text-muted-foreground">Gestion des emplois du temps</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>
              
              {/* 2FA Setup Button */}
              {!user?.twoFactorEnabled && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShow2FASetup(true)}
                  className="hidden sm:flex items-center gap-2 border-orange-500/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  <Shield className="h-4 w-4" />
                  Activer 2FA
                </Button>
              )}
              
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Bonjour, {user?.firstName} ! 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre tableau de bord
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getQuickActions().map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-transparent hover:border-primary/20"
              >
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

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
      </main>

      {/* 2FA Setup Dialog */}
      <TwoFactorSetup 
        open={show2FASetup} 
        onOpenChange={setShow2FASetup}
      />
    </div>
  );
};

export default Dashboard;
