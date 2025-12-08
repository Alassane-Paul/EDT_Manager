import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Bell,
  LogOut,
  Menu,
  Shield
} from "lucide-react";
import { useState } from "react";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

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

export const PageLayout = ({ children, title }: PageLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {title || "EDT Manager"}
                </h1>
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

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="sm:hidden">
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="text-center pb-4 border-b">
                      <p className="text-sm font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                        {getRoleLabel(user?.role || '')}
                      </span>
                    </div>
                    {!user?.twoFactorEnabled && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShow2FASetup(true)}
                        className="w-full border-orange-500/50 text-orange-600"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Activer 2FA
                      </Button>
                    )}
                    <Button variant="destructive" onClick={handleLogout} className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button variant="destructive" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 2FA Setup Dialog */}
      <TwoFactorSetup 
        open={show2FASetup} 
        onOpenChange={setShow2FASetup}
      />
    </div>
  );
};
