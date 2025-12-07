import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth"
import Dashboard from "@/pages/Dashboard"
import Index from "@/pages/Index"
import NotFound from "@/pages/NotFound";
import { BrowserRouter, createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};
const router = createBrowserRouter([

    {
        path: "/",
        children: [
            {
                index: true,
                element: <Index />
            },
            {
                path: "auth",
                element: <Auth />
            },
            {
                path: "dashboard",
                element:
                    <ProtectedRoute >
                        <Dashboard />
                    </ProtectedRoute>
            },
            {
                path: "*",
                element: <NotFound />
            },
        ]
    }

])

const Router = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default Router