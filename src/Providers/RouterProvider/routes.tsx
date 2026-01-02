import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import EmploiTempsEtudiant from "@/pages/etudiant/EmploiTemps";
import CoursEtudiant from "@/pages/etudiant/Cours";
import NotificationsEtudiant from "@/pages/etudiant/Notifications";
import AbsencesEtudiant from "@/pages/etudiant/Absences";
import EmploiTempsPersonnel from "@/pages/personnel/EmploiTemps";
import SallesPersonnel from "@/pages/personnel/Salles";
import EmploiTempsEnseignant from "@/pages/enseignant/EmploiTemps";
import CoursEnseignant from "@/pages/enseignant/Cours";
import AbsencesEnseignant from "@/pages/enseignant/Absences";
import RattrapagesEnseignant from "@/pages/enseignant/Rattrapages";
import { Routes, Route, Navigate } from "react-router-dom";
import { EnseignantDetails, EnseignantForm, EnseignantsList } from "@/pages/superadmin/enseignants";
import EnseignantSchedule from "@/pages/superadmin/enseignants/EnseignantSchedule";
import StudentSchedule from "@/pages/superadmin/students/StudentSchedule";
import { ClasseDetails, ClasseForm, ClasseList } from "@/pages/superadmin/classes";
import { SalleList, SalleForm, SalleDetails } from "@/pages/superadmin/salles";
import { MatiereList, MatiereForm, MatiereDetails } from "@/pages/superadmin/matieres";
import { RattrapageList, RattrapageForm, RattrapageDetails } from "@/pages/superadmin/rattrapages";
import { UserList, UserForm, UserDetails } from "@/pages/superadmin/users";
import { EtablissementList, EtablissementForm, EtablissementDetails } from "@/pages/superadmin/etablissements";
import EmploiTempsList from "@/pages/superadmin/emplois_temps/EmploiTempsList";
import GenerationEmploiTemps from "@/pages/superadmin/emplois_temps/GenerationEmploiTemps";
import EmploiTempsDetails from "@/pages/superadmin/emplois_temps/EmploiTempsDetails";
import Settings from "@/pages/superadmin/settings/Settings";

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

      {/* Route Profil accessible à tous les connectés */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

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
      <Route
        path="/etudiant/absences"
        element={
          <ProtectedRoute allowedRoles={['admin', 'etudiant']}>
            <AbsencesEtudiant />
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
        path="/gestion/teachers/:id/schedule"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EnseignantSchedule />
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
        path="/gestion/classes/:classeId/schedule"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'etudiant', 'personnel']}>
            <StudentSchedule />
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

      {/* Routes Salles */}
      <Route
        path="/gestion/salles"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <SalleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/salles/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <SalleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/salles/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <SalleDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/salles/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <SalleForm />
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
      <Route
        path="/gestion/matieres/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <MatiereForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/matieres/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <MatiereDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/matieres/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <MatiereForm />
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
      <Route
        path="/gestion/rattrapages/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <RattrapageForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/rattrapages/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <RattrapageDetails />
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
      <Route
        path="/gestion/etablissements/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <EtablissementForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/etablissements/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <EtablissementDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/etablissements/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <EtablissementForm />
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/utilisateurs/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <UserDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utilisateurs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <UserList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utilisateurs/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <UserForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utilisateurs/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <UserForm />
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
        path="/enseignant/cours/:id"
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
      <Route
        path="/enseignant/rattrapages"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <RattrapagesEnseignant />
          </ProtectedRoute>
        }
      />

      {/* Routes Gestion Emplois du Temps */}
      <Route
        path="/gestion/emplois-temps"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EmploiTempsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/emplois-temps/new"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <GenerationEmploiTemps />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion/emplois-temps/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <EmploiTempsDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gestion/settings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
