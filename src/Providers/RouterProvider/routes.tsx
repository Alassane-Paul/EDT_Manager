import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { Routes, Route, Navigate } from "react-router-dom";

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

  // Vérification des rôles si spécifiés
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
      
      {/* Routes Admin uniquement */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes Gestion (Admin, Directeur, Responsable pédagogique) */}
      <Route 
        path="/gestion/*" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes Enseignants */}
      <Route 
        path="/enseignant/*" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur', 'responsable_pedagogique', 'enseignant']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
