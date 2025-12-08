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
  Building2
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);

  const handleActionClick = (route: string) => {
    navigate(route);
  };

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
              className="hidden sm:flex items-center gap-2 border-orange-500/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
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
