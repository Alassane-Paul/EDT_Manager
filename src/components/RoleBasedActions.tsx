import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Users,
  BookOpen,
  Clock,
  RefreshCw,
  GraduationCap,
  DoorOpen,
  Building2,
  Settings,
  UserCog,
  Shield,
  BarChart3,
  FileText,
  Bell
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  route?: string;
}

// Définition des actions par rôle
const roleActions: Record<UserRole, QuickAction[]> = {
  admin: [
    {
      title: "Emplois du temps",
      description: "Consulter et gérer tous les plannings",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/admin/emplois-temps",
    },
    {
      title: "Utilisateurs",
      description: "Gérer tous les utilisateurs du système",
      icon: UserCog,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      route: "/admin/utilisateurs",
    },
    {
      title: "Établissements",
      description: "Gérer les établissements",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      route: "/admin/etablissements",
    },
    {
      title: "Enseignants",
      description: "Gérer les profils enseignants",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      route: "/gestion/enseignants",
    },
    {
      title: "Classes",
      description: "Gérer les classes et groupes",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      route: "/gestion/classes",
    },
    {
      title: "Salles",
      description: "Gérer les salles de cours",
      icon: DoorOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      route: "/gestion/salles",
    },
    {
      title: "Matières",
      description: "Gérer les matières enseignées",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      route: "/gestion/matieres",
    },
    {
      title: "Statistiques",
      description: "Tableau de bord analytique",
      icon: BarChart3,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      route: "/admin/statistiques",
    },
    {
      title: "Paramètres",
      description: "Configuration du système",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-800/50",
      route: "/gestion/settings",
    },
  ],
  directeur: [
    {
      title: "Emplois du temps",
      description: "Consulter et gérer les plannings",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/gestion/emplois-temps",
    },
    {
      title: "Enseignants",
      description: "Gérer les profils enseignants",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      route: "/gestion/enseignants",
    },
    {
      title: "Classes",
      description: "Gérer les classes et groupes",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      route: "/gestion/classes",
    },
    {
      title: "Salles",
      description: "Gérer les salles de cours",
      icon: DoorOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      route: "/gestion/salles",
    },
    {
      title: "Matières",
      description: "Gérer les matières enseignées",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      route: "/gestion/matieres",
    },
    {
      title: "Rattrapages",
      description: "Planifier les séances de rattrapage",
      icon: RefreshCw,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      route: "/gestion/rattrapages",
    },
    {
      title: "Statistiques",
      description: "Rapports et analyses",
      icon: BarChart3,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      route: "/gestion/statistiques",
    },
  ],
  responsable_pedagogique: [
    {
      title: "Emplois du temps",
      description: "Consulter et gérer les plannings",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/gestion/emplois-temps",
    },
    {
      title: "Enseignants",
      description: "Gérer les profils enseignants",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      route: "/gestion/enseignants",
    },
    {
      title: "Classes",
      description: "Gérer les classes et groupes",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      route: "/gestion/classes",
    },
    {
      title: "Salles",
      description: "Gérer les salles de cours",
      icon: DoorOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      route: "/gestion/salles",
    },
    {
      title: "Matières",
      description: "Gérer les matières enseignées",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      route: "/gestion/matieres",
    },
    {
      title: "Rattrapages",
      description: "Planifier les séances de rattrapage",
      icon: RefreshCw,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      route: "/gestion/rattrapages",
    },
  ],
  enseignant: [
    {
      title: "Mon emploi du temps",
      description: "Consulter mon planning",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/enseignant/emploi-temps",
    },
    {
      title: "Mon planning",
      description: "Vue détaillée de mes cours",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      route: "/enseignant/planning",
    },
    {
      title: "Mes cours",
      description: "Gérer mes cours",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      route: "/enseignant/cours",
    },
    {
      title: "Rattrapages",
      description: "Demander un rattrapage",
      icon: RefreshCw,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      route: "/enseignant/rattrapages",
    },
    {
      title: "Absences",
      description: "Déclarer une absence",
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      route: "/enseignant/absences",
    },
  ],
  etudiant: [
    {
      title: "Mon emploi du temps",
      description: "Consulter mon planning de cours",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/etudiant/emploi-temps",
    },
    {
      title: "Mes cours",
      description: "Liste de mes cours",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      route: "/etudiant/cours",
    },
    {
      title: "Notifications",
      description: "Alertes et modifications",
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      route: "/etudiant/notifications",
    },
  ],
  personnel: [
    {
      title: "Emplois du temps",
      description: "Consulter les plannings",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/personnel/emplois-temps",
    },
    {
      title: "Salles",
      description: "Disponibilité des salles",
      icon: DoorOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      route: "/personnel/salles",
    },
  ],
};

interface RoleBasedActionsProps {
  onActionClick?: (route: string) => void;
}

export const RoleBasedActions = ({ onActionClick }: RoleBasedActionsProps) => {
  const { user } = useAuth();

  if (!user) return null;

  const actions = roleActions[user.role] || roleActions.personnel;

  const handleClick = (route?: string) => {
    if (route && onActionClick) {
      onActionClick(route);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-transparent hover:border-primary/20"
          onClick={() => handleClick(action.route)}
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
  );
};

// Composant pour vérifier si l'utilisateur a un rôle spécifique
interface HasRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasRole = ({ roles, children, fallback = null }: HasRoleProps) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Hook pour vérifier les permissions
export const useRoleCheck = () => {
  const { user } = useAuth();

  const hasRole = (roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = () => hasRole(['admin']);
  const isManagement = () => hasRole(['admin', 'directeur', 'responsable_pedagogique']);
  const isTeacher = () => hasRole(['enseignant']);
  const isStudent = () => hasRole(['etudiant']);

  return { hasRole, isAdmin, isManagement, isTeacher, isStudent };
};
