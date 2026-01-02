import { useQuery } from "@tanstack/react-query";
import { statistiquesApi } from "@/api/statistiques/api";

export const useGeneralStats = () => {
    return useQuery({
        queryKey: ["stats", "general"],
        queryFn: async () => {
            const response = await statistiquesApi.getGenerales();
            // The backend returns { statistiques: { ... }, code: ... }
            // We want to return the inner 'statistiques' object
            return (response as any).statistiques;
        },
    });
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ["stats", "dashboard"],
        queryFn: async () => {
            const response = await statistiquesApi.getDashboard();
            // The backend returns { tableau_de_bord: { ... }, code: ... }
            return (response as any).tableau_de_bord;
        },
    });
};
