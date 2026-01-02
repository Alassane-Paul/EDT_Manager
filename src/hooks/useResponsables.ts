import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { responsablesApi } from "@/api/responsables/api";
import { ResponsablePedagogiqueFormData } from "@/types/staff";
import { toast } from "sonner";

export function useResponsables(params?: any) {
    const query = useQuery({
        queryKey: ["responsables", params],
        queryFn: () => responsablesApi.getAll(params),
    });

    return {
        rps: query.data?.rps ?? [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCreateResponsable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ResponsablePedagogiqueFormData) => responsablesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["responsables"] });
            toast.success("Responsable créé avec succès");
        },
        onError: () => toast.error("Erreur création responsable"),
    });
}

export function useUpdateResponsable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ResponsablePedagogiqueFormData> }) =>
            responsablesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["responsables"] });
            toast.success("Responsable mis à jour");
        },
        onError: () => toast.error("Erreur mise à jour responsable"),
    });
}
