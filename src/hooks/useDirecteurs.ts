import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directeursApi } from "@/api/directeurs/api";
import { DirecteurFormData } from "@/types/staff";
import { toast } from "sonner";

export function useDirecteurs(params?: any) {
    const query = useQuery({
        queryKey: ["directeurs", params],
        queryFn: () => directeursApi.getAll(params),
    });

    return {
        directeurs: query.data?.directeurs ?? [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCreateDirecteur() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DirecteurFormData) => directeursApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["directeurs"] });
            toast.success("Directeur créé avec succès");
        },
        onError: () => toast.error("Erreur création directeur"),
    });
}

export function useUpdateDirecteur() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<DirecteurFormData> }) =>
            directeursApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["directeurs"] });
            toast.success("Directeur mis à jour");
        },
        onError: () => toast.error("Erreur mise à jour directeur"),
    });
}
