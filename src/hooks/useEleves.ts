import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { elevesApi } from "@/api/eleves/api";
import { EleveFilters, EleveFormData } from "@/types/eleves";
import { toast } from "sonner";

export function useEleves(filters?: EleveFilters) {
    const query = useQuery({
        queryKey: ["eleves", filters],
        queryFn: () => elevesApi.getAll(filters),
    });

    return {
        eleves: query.data?.eleves ?? [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useEleve(id: string) {
    return useQuery({
        queryKey: ["eleve", id],
        queryFn: () => elevesApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateEleve() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EleveFormData) => elevesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["eleves"] });
            toast.success("Élève créé avec succès");
        },
        onError: () => {
            toast.error("Erreur lors de la création de l'élève");
        },
    });
}

export function useUpdateEleve() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<EleveFormData> }) =>
            elevesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["eleves"] });
            toast.success("Élève mis à jour");
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteEleve() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => elevesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["eleves"] });
            toast.success("Élève supprimé");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        },
    });
}
