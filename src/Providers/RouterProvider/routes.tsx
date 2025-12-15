import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import EmploiTempsEtudiant from "@/pages/etudiant/EmploiTemps";
import CoursEtudiant from "@/pages/etudiant/Cours";
import NotificationsEtudiant from "@/pages/etudiant/Notifications";
import EmploiTempsPersonnel from "@/pages/personnel/EmploiTemps";
import SallesPersonnel from "@/pages/personnel/Salles";
import EmploiTempsEnseignant from "@/pages/enseignant/EmploiTemps";
import CoursEnseignant from "@/pages/enseignant/Cours";
import AbsencesEnseignant from "@/pages/enseignant/Absences";
import { Routes, Route, Navigate } from "react-router-dom";
import { EnseignantDetails, EnseignantForm, EnseignantsList } from "@/pages/superadmin/enseignants";
import { ClasseDetails, ClasseForm, ClasseList } from "@/pages/superadmin/classes";
import { MatiereList } from "@/pages/superadmin/matieres";
import { RattrapageList } from "@/pages/superadmin/rattrapages";
import { UserList } from "@/pages/superadmin/users";
import { EtablissementList } from "@/pages/superadmin/etablissements";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />

      {/* Dashboard - accessible à tous les utilisateurs connectés */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Routes Étudiant */}
      <Route
        path="/etudiant/emploi-temps"
        element={
          <ProtectedRoute allowedRoles={['admin', 'etudiant']}>
            <EmploiTempsEtudiant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/etudiant/cours"
        element={
          <ProtectedRoute allowedRoles={['admin', 'etudiant']}>
            <CoursEtudiant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/etudiant/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin', 'etudiant']}>
            <NotificationsEtudiant />
          </ProtectedRoute>
        }
      />

      {/* Routes Personnel */}
      <Route
        path="/personnel/emplois-temps"
        element={
          <ProtectedRoute allowedRoles={['admin', 'personnel']}>
            <EmploiTempsPersonnel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personnel/salles"
        element={
          <ProtectedRoute allowedRoles={['admin', 'personnel']}>
            <SallesPersonnel />
          </ProtectedRoute>
        }
      />

      {/* Routes Enseignants - doivent être avant le wildcard */}
      <Route
        path="/gestion/teachers/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EnseignantForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/teachers/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EnseignantForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/teachers/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EnseignantDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/teachers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EnseignantsList />
          </ProtectedRoute>
        }
      />

      {/* Routes Classes */}
      <Route
        path="/gestion/classes"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <ClasseList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/classes/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <ClasseForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/classes/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <ClasseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/classes/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <ClasseForm />
          </ProtectedRoute>
        }
      />

      {/* Routes Matières */}
      <Route
        path="/gestion/matieres"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <MatiereList />
          </ProtectedRoute>
        }
      />

      {/* Routes Rattrapages */}
      <Route
        path="/gestion/rattrapages"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <RattrapageList />
          </ProtectedRoute>
        }
      />

      {/* Routes Établissements */}
      <Route
        path="/gestion/etablissements"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <EtablissementList />
          </ProtectedRoute>
        }
      />

      {/* Routes Utilisateurs */}
      <Route
        path="/admin/utilisateurs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <UserList />
          </ProtectedRoute>
        }
      />

      {/* Routes Enseignants */}
      <Route
        path="/enseignant/emploi-temps"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <EmploiTempsEnseignant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enseignant/cours"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <CoursEnseignant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enseignant/absences"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <AbsencesEnseignant />
          </ProtectedRoute>
        }
      />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
