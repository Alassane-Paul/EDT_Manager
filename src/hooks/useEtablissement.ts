import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { etablissementsApi } from "@/api/etablissements/api";
import { EtablissementFormData } from "@/types/etablissements";
import { useAuth } from "@/contexts/AuthContext";

export function useEtablissement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const establishmentId = user?.establishmentId;

    const query = useQuery({
        queryKey: ["etablissement", establishmentId],
        queryFn: () => etablissementsApi.getById(establishmentId!),
        enabled: !!establishmentId,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<EtablissementFormData>) =>
            etablissementsApi.update(establishmentId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["etablissement", establishmentId] });
        },
    });

    return {
        etablissement: query.data,
        isLoading: query.isLoading,
        error: query.error,
        updateEtablissement: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
