import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accreditationsApi } from "@/api/accreditations/api";
import { toast } from "sonner";

export function useAccreditations() {
    const query = useQuery({
        queryKey: ["accreditations"],
        queryFn: () => accreditationsApi.getAll(),
    });

    return {
        accreditations: query.data?.accreditations ?? [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCreateAccreditation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            utilisateur_id: string;
            module: string;
            date_debut: string;
            date_fin: string;
            description?: string;
        }) => accreditationsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accreditations"] });
            toast.success("Accréditation accordée avec succès");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Erreur lors de l'accréditation";
            toast.error(message);
        },
    });
}

export function useDeleteAccreditation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accreditationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accreditations"] });
            toast.success("Accréditation révoquée");
        },
        onError: () => {
            toast.error("Erreur lors de la révocation");
        },
    });
}

